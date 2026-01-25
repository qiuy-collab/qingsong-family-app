
import React, { useState, useMemo } from 'react';
import { View, ServiceLog } from '../types';
import { SERVICE_LOGS } from '../constants';
import BottomNav from '../components/BottomNav';

interface ServiceTrackingProps {
  onNavigate: (view: View, params?: any) => void;
  onShowToast: (message: string) => void;
}

const DAYS_NAME = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// 模拟不同日期的日志数据
const MOCK_DAILY_LOGS: Record<number, ServiceLog[]> = {
  0: SERVICE_LOGS, // 周一
  1: [SERVICE_LOGS[0], SERVICE_LOGS[1]], // 周二
  2: [SERVICE_LOGS[0], SERVICE_LOGS[2], SERVICE_LOGS[3]], // 周三
  3: [SERVICE_LOGS[1], SERVICE_LOGS[4]], // 周四
  4: SERVICE_LOGS.slice(0, 3), // 周五
  5: [], // 周六
  6: SERVICE_LOGS // 周日
};

const ServiceTracking: React.FC<ServiceTrackingProps> = ({ onNavigate, onShowToast }) => {
  // 动态获取本周日期
  const weekDates = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0 是周日
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 调整到本周一
    const monday = new Date(now.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.getDate();
    });
  }, []);

  // 默认选中今天
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const currentLogs = useMemo(() => MOCK_DAILY_LOGS[selectedDay] || [], [selectedDay]);

  const handleDayChange = (index: number) => {
    if (index === selectedDay) return;
    setIsRefreshing(true);
    setSelectedDay(index);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative overflow-hidden">
      {/* 头部 */}
      <header className="shrink-0 bg-white px-4 pt-12 pb-4 flex items-center justify-between sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <button onClick={() => onNavigate(View.HOME)} className="p-2 text-slate-600 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-base font-bold">服务日志追踪</h1>
        <button onClick={() => onShowToast('报告已生成并发送至您的邮箱')} className="p-2 text-slate-600">
          <span className="material-symbols-outlined text-xl">ios_share</span>
        </button>
      </header>

      {/* 动态周历切换器 */}
      <section className="shrink-0 bg-white px-4 py-4 shadow-sm border-b border-slate-100 z-40">
        <div className="flex justify-between items-center">
          {DAYS_NAME.map((day, index) => (
            <button
              key={day}
              onClick={() => handleDayChange(index)}
              className="flex flex-col items-center gap-1 group"
            >
              <span className={`text-[10px] font-bold transition-colors ${selectedDay === index ? 'text-primary' : 'text-slate-400'}`}>
                {day}
              </span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                selectedDay === index 
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              } ${index === todayIndex ? 'ring-2 ring-primary/20 ring-offset-2' : ''}`}>
                {weekDates[index]}
              </div>
              {selectedDay === index && (
                <div className="w-1 h-1 bg-primary rounded-full mt-0.5"></div>
              )}
            </button>
          ))}
        </div>
      </section>

      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-6 pb-32 space-y-6">
        {/* 状态概览 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service Status</p>
              <h2 className="text-base font-bold text-slate-800">
                {selectedDay === todayIndex ? '今日服务进度' : `${DAYS_NAME[selectedDay]}服务记录`}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-primary">{currentLogs.filter(l => l.status === 'done').length}</span>
              <span className="text-slate-400 text-xs font-bold"> / {currentLogs.length}</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${currentLogs.length ? (currentLogs.filter(l => l.status === 'done').length / currentLogs.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* 护理员信息 */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between" onClick={() => onShowToast('拨打护理员电话...')}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?u=nurse1" className="w-10 h-10 rounded-full object-cover" alt="Nurse" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">李芳芳</h3>
              <p className="text-[10px] text-slate-400">高级康复护理师 · 实时在线</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-lg fill-icon">call</span>
          </div>
        </div>

        {/* 日志时间轴 */}
        <div className={`space-y-4 transition-opacity duration-300 ${isRefreshing ? 'opacity-30' : 'opacity-100'}`}>
          {currentLogs.length > 0 ? (
            currentLogs.map((log, i) => (
              <div key={i} className="relative pl-8 pb-4 last:pb-0">
                {i < currentLogs.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-100"></div>
                )}
                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 ${
                  log.status === 'done' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-slate-200 text-slate-300'
                }`}>
                  <span className="material-symbols-outlined text-[14px] font-bold">
                    {log.status === 'done' ? 'done' : log.icon}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-slate-800">{log.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{log.time}</span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">{log.description}</p>
                  {log.image && (
                    <div 
                      className="mt-3 rounded-lg overflow-hidden aspect-video bg-slate-100 cursor-zoom-in active:scale-95 transition-transform"
                      onClick={() => setPreviewImage(log.image!)}
                    >
                      <img src={log.image} className="w-full h-full object-cover" alt="log" />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center text-slate-300 gap-3">
              <span className="material-symbols-outlined text-5xl opacity-20">inventory_2</span>
              <p className="text-xs font-bold">暂无相关服务记录</p>
            </div>
          )}
        </div>
      </main>

      {/* 全屏图片预览模态框 */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <div className="absolute top-12 right-6">
            <button 
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center backdrop-blur-md active:scale-90 transition-transform"
              onClick={() => setPreviewImage(null)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <img 
            src={previewImage} 
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" 
            alt="Preview" 
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-12 text-white/60 text-xs font-medium tracking-widest uppercase">
            Tap anywhere to dismiss
          </p>
        </div>
      )}

      <BottomNav activeView={View.SERVICE} onNavigate={onNavigate} />
    </div>
  );
};

export default ServiceTracking;
