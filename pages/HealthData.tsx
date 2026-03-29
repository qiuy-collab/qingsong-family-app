import React, { useEffect, useMemo, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { storage } from '../lib/storage';
import { appDataService } from '../services/appDataService';
import type { AuthProfile, HealthMetrics, HealthPoint, HealthSummary } from '../types';
import { View } from '../types';

interface HealthDataProps {
  onNavigate: (view: View) => void;
  onShowToast: (msg: string) => void;
}

const buildChartPath = (points: { x: number; y: number }[]) =>
  points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');

const normalizePoints = (metrics: HealthMetrics, field: 'bpm' | 'systolic') => {
  const values = metrics.points.map((point) => point[field]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return metrics.points.map((point, index) => ({
    x: metrics.range === '7d' ? index * 50 : index * 100,
    y: 82 - ((point[field] - min) / range) * 50,
  }));
};

const HealthData: React.FC<HealthDataProps> = ({ onNavigate, onShowToast }) => {
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const elderId = useMemo(() => {
    const profile = storage.getProfile<AuthProfile>();
    return profile?.default_elder_id ?? 'e1234567-e89b-12d3-a456-426614174000';
  }, []);

  const loadData = async (activeRange: '7d' | '30d', showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [summaryResult, metricsResult] = await Promise.all([
        appDataService.getHealthSummary(elderId),
        appDataService.getHealthMetrics(elderId, activeRange),
      ]);
      setSummary(summaryResult);
      setMetrics(metricsResult);
    } catch (error) {
      onShowToast('健康数据加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData(range);
  }, [elderId, range]);

  const heartRatePoints = metrics ? normalizePoints(metrics, 'bpm') : [];
  const bloodPressurePoints = metrics ? normalizePoints(metrics, 'systolic') : [];
  const bpPath = bloodPressurePoints.length > 1 ? buildChartPath(bloodPressurePoints) : '';
  const hrPath = heartRatePoints.length > 1 ? buildChartPath(heartRatePoints) : '';
  const latestPoint = metrics?.points[metrics.points.length - 1];

  if (loading || !summary || !metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">
        正在加载健康数据…
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-50">
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white/80 px-6 py-12 shadow-sm backdrop-blur-md">
        <button onClick={() => onNavigate(View.HOME)} className="p-2 -ml-2 text-slate-600 transition-transform active:scale-90">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-base font-bold">健康看板</h1>
        <button
          onClick={() => void loadData(range, true)}
          className="p-2 -mr-2 text-slate-600 transition-all duration-500 active:rotate-180"
        >
          <span className={`material-symbols-outlined text-xl ${refreshing ? 'animate-spin' : ''}`}>sync</span>
        </button>
      </header>

      <main className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-5 pb-32 pt-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={summary.elder_avatar_url} className="h-12 w-12 rounded-full border-2 border-white shadow-sm" alt="Profile" />
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">{summary.elder_name}</h2>
            <p className="text-[10px] font-medium text-slate-400">
              数据同步于 {refreshing ? '正在更新…' : summary.last_sync_time}
            </p>
          </div>
        </div>

        {summary.warning_title && summary.warning_message && (
          <div className="animate-in fade-in slide-in-from-top-2 flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
            <span className="material-symbols-outlined fill-icon animate-pulse text-red-500">warning</span>
            <div>
              <h3 className="text-sm font-bold text-red-800">{summary.warning_title}</h3>
              <p className="mt-1 text-xs text-red-600">{summary.warning_message}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="mb-2 text-xs font-bold text-slate-400">平均心率</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800">{summary.average_bpm}</span>
              <span className="text-[10px] text-slate-400">BPM</span>
            </div>
            <div className="mt-3 flex w-fit items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 text-green-600">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <span className="text-[9px] font-bold">状态稳定</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="mb-2 text-xs font-bold text-slate-400">当前血压</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black ${summary.blood_pressure_level === '偏高' ? 'text-red-500' : 'text-slate-800'}`}>
                {summary.current_blood_pressure}
              </span>
            </div>
            <div
              className={`mt-3 flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 ${
                summary.blood_pressure_level === '偏高' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}
            >
              <span className="material-symbols-outlined text-[10px] fill-icon">
                {summary.blood_pressure_level === '偏高' ? 'trending_up' : 'check_circle'}
              </span>
              <span className="text-[9px] font-bold">{summary.blood_pressure_level}</span>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">变化趋势</h3>
            <div className="flex rounded-lg bg-slate-100 p-0.5">
              {(['7d', '30d'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setRange(item)}
                  className={`rounded-md px-3 py-1 text-[10px] font-bold transition-all ${
                    range === item ? 'bg-white text-primary shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {item === '7d' ? '7 天' : '30 天'}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-1 rounded-full bg-primary" />
                <span className="text-xs font-bold text-slate-700">血压走势</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400">mmHg</span>
            </div>
            <div className="relative h-32 w-full">
              <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                <path d={bpPath} fill="none" stroke="#3B82F6" strokeLinecap="round" strokeWidth="2.5" />
                {latestPoint && bloodPressurePoints.length > 0 && (
                  <circle
                    cx={bloodPressurePoints[bloodPressurePoints.length - 1].x}
                    cy={bloodPressurePoints[bloodPressurePoints.length - 1].y}
                    r="4"
                    fill="#3B82F6"
                    stroke="white"
                    strokeWidth="2"
                  />
                )}
              </svg>
              {latestPoint && (
                <div className="absolute right-0 top-0 rounded bg-slate-800 px-1.5 py-0.5 text-[8px] text-white shadow-lg">
                  {latestPoint.blood_pressure_display}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-1 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-slate-700">心率趋势</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400">BPM</span>
            </div>
            <div className="relative h-32 w-full">
              <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                <path d={hrPath} fill="none" stroke="#F43F5E" strokeLinecap="round" strokeWidth="2.5" />
                {latestPoint && heartRatePoints.length > 0 && (
                  <circle
                    cx={heartRatePoints[heartRatePoints.length - 1].x}
                    cy={heartRatePoints[heartRatePoints.length - 1].y}
                    r="4"
                    fill="#F43F5E"
                    stroke="white"
                    strokeWidth="2"
                  />
                )}
              </svg>
              {latestPoint && (
                <div className="absolute right-0 top-0 rounded bg-slate-800 px-1.5 py-0.5 text-[8px] text-white shadow-lg">
                  {latestPoint.bpm} BPM
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <BottomNav activeView={View.HEALTH} onNavigate={onNavigate} />
    </div>
  );
};

export default HealthData;
