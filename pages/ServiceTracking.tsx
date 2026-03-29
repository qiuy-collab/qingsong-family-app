import React, { useEffect, useMemo, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { storage } from '../lib/storage';
import { appDataService } from '../services/appDataService';
import type { AuthProfile, ServiceLog } from '../types';
import { View } from '../types';

interface ServiceTrackingProps {
  onNavigate: (view: View, params?: Record<string, unknown>) => void;
  onShowToast: (message: string) => void;
}

const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const ServiceTracking: React.FC<ServiceTrackingProps> = ({ onNavigate, onShowToast }) => {
  const elderId = useMemo(() => {
    const profile = storage.getProfile<AuthProfile>();
    return profile?.default_elder_id ?? 'e1234567-e89b-12d3-a456-426614174000';
  }, []);

  const weekDates = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date.getDate();
    });
  }, []);

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadLogs = async () => {
      try {
        setRefreshing(true);
        const result = await appDataService.listServiceLogs(elderId, selectedDay);
        if (!cancelled) {
          setLogs(result);
        }
      } catch (error) {
        if (!cancelled) {
          onShowToast('服务日志加载失败');
        }
      } finally {
        if (!cancelled) {
          setRefreshing(false);
        }
      }
    };
    void loadLogs();
    return () => {
      cancelled = true;
    };
  }, [elderId, selectedDay, onShowToast]);

  const completedCount = logs.filter((item) => item.status === 'done').length;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-50">
      <header className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 pb-4 pt-12 shadow-sm">
        <button onClick={() => onNavigate(View.HOME)} className="p-2 text-slate-600 transition-transform active:scale-90">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-base font-bold">服务日志追踪</h1>
        <button onClick={() => onShowToast('报告将发送到您的邮箱')} className="p-2 text-slate-600">
          <span className="material-symbols-outlined text-xl">ios_share</span>
        </button>
      </header>

      <section className="z-40 shrink-0 border-b border-slate-100 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          {DAY_NAMES.map((day, index) => (
            <button key={day} onClick={() => setSelectedDay(index)} className="group flex flex-col items-center gap-1">
              <span className={`text-[10px] font-bold transition-colors ${selectedDay === index ? 'text-primary' : 'text-slate-400'}`}>
                {day}
              </span>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                  selectedDay === index
                    ? 'scale-105 bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                } ${index === todayIndex ? 'ring-2 ring-primary/20 ring-offset-2' : ''}`}
              >
                {weekDates[index]}
              </div>
              {selectedDay === index && <div className="mt-0.5 h-1 w-1 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </section>

      <main className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-4 pb-32 pt-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Service Status</p>
              <h2 className="text-base font-bold text-slate-800">
                {selectedDay === todayIndex ? '今日服务进度' : `${DAY_NAMES[selectedDay]} 服务记录`}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-primary">{completedCount}</span>
              <span className="text-xs font-bold text-slate-400"> / {logs.length}</span>
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${logs.length ? (completedCount / logs.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4"
          onClick={() => onShowToast('正在拨打护理员电话…')}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?u=nurse1" className="h-10 w-10 rounded-full object-cover" alt="Nurse" />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">李芳芳</h3>
              <p className="text-[10px] text-slate-400">高级康复护理师 · 实时在线</p>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-primary">
            <span className="material-symbols-outlined text-lg fill-icon">call</span>
          </div>
        </div>

        <div className={`space-y-4 transition-opacity duration-300 ${refreshing ? 'opacity-40' : 'opacity-100'}`}>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={log.id} className="relative pb-4 pl-8 last:pb-0">
                {index < logs.length - 1 && <div className="absolute bottom-0 left-[11px] top-6 w-px bg-slate-100" />}
                <div
                  className={`absolute left-0 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    log.status === 'done' ? 'border-primary bg-primary text-white shadow-sm' : 'border-slate-200 bg-white text-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px] font-bold">{log.status === 'done' ? 'done' : log.icon}</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="text-sm font-bold text-slate-800">{log.title}</h4>
                    <span className="text-[10px] font-medium text-slate-400">{log.time}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">{log.description}</p>
                  {log.extra && <p className="mt-2 text-[11px] font-semibold text-primary">{log.extra}</p>}
                  {log.image && (
                    <div
                      className="mt-3 aspect-video cursor-zoom-in overflow-hidden rounded-lg bg-slate-100 transition-transform active:scale-95"
                      onClick={() => setPreviewImage(log.image!)}
                    >
                      <img src={log.image} className="h-full w-full object-cover" alt="log" />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-300">
              <span className="material-symbols-outlined text-5xl opacity-20">inventory_2</span>
              <p className="text-xs font-bold">当天暂无服务记录</p>
            </div>
          )}
        </div>
      </main>

      {previewImage && (
        <div
          className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <div className="absolute right-6 top-12">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-transform active:scale-90"
              onClick={() => setPreviewImage(null)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <img
            src={previewImage}
            className="max-h-[80vh] max-w-full animate-in rounded-lg object-contain shadow-2xl duration-300 zoom-in-95"
            alt="Preview"
            onClick={(event) => event.stopPropagation()}
          />
          <p className="absolute bottom-12 text-xs font-medium uppercase tracking-widest text-white/60">Tap anywhere to dismiss</p>
        </div>
      )}

      <BottomNav activeView={View.SERVICE} onNavigate={onNavigate} />
    </div>
  );
};

export default ServiceTracking;
