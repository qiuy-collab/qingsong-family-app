
import React, { useState, useMemo } from 'react';
import { View } from '../types';
import BottomNav from '../components/BottomNav';

interface HealthDataProps {
  onNavigate: (view: View) => void;
  onShowToast: (msg: string) => void;
}

const HealthData: React.FC<HealthDataProps> = ({ onNavigate, onShowToast }) => {
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 模拟同步时间：格式为 HH:mm
  const lastSyncTime = useMemo(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }, [isRefreshing]);

  const [bpTooltip, setBpTooltip] = useState<{ x: number, val: string, show: boolean }>({ x: 0, val: '', show: false });
  const [hrTooltip, setHrTooltip] = useState<{ x: number, val: string, show: boolean }>({ x: 0, val: '', show: false });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onShowToast('健康监测数据已同步至最新状态');
    }, 1000);
  };

  // 图表数据保持逻辑...
  const bpData = useMemo(() => ({
    '7d': [
      { x: 0, y: 80, val: '118/78' },
      { x: 50, y: 75, val: '120/80' },
      { x: 100, y: 65, val: '125/82' },
      { x: 150, y: 70, val: '122/80' },
      { x: 200, y: 55, val: '130/85' },
      { x: 250, y: 75, val: '124/81' },
      { x: 300, y: 50, val: '145/95' }
    ],
    '30d': [
      { x: 0, y: 60, val: '120/80' },
      { x: 100, y: 85, val: '115/75' },
      { x: 200, y: 20, val: '140/90' },
      { x: 300, y: 70, val: '122/80' }
    ]
  }), []);

  const hrData = useMemo(() => ({
    '7d': [
      { x: 0, y: 70, val: '68' },
      { x: 50, y: 60, val: '72' },
      { x: 100, y: 80, val: '65' },
      { x: 150, y: 65, val: '70' },
      { x: 200, y: 75, val: '68' },
      { x: 250, y: 50, val: '75' },
      { x: 300, y: 60, val: '72' }
    ],
    '30d': [
      { x: 0, y: 75, val: '70' },
      { x: 75, y: 55, val: '75' },
      { x: 150, y: 65, val: '72' },
      { x: 225, y: 45, val: '78' },
      { x: 300, y: 55, val: '71' }
    ]
  }), []);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>, type: 'bp' | 'hr') => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const normalizedX = (mouseX / rect.width) * 300;
    
    const dataSet = type === 'bp' ? bpData[range] : hrData[range];
    let closest = dataSet[0];
    let minDiff = Math.abs(normalizedX - dataSet[0].x);
    dataSet.forEach(p => {
      const diff = Math.abs(normalizedX - p.x);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    });

    if (type === 'bp') setBpTooltip({ x: closest.x, val: closest.val, show: true });
    else setHrTooltip({ x: closest.x, val: closest.val, show: true });
  };

  const chartPaths = {
    'bp': {
      '7d': "M0 80 L 50 75 L 100 65 L 150 70 L 200 55 L 250 75 L 300 50",
      '30d': "M0 60 C 50 40, 100 85, 100 85 S 150 20, 200 20 S 250 40, 300 70"
    },
    'hr': {
      '7d': "M0 70 L 50 60 L 100 80 L 150 65 L 200 75 L 250 50 L 300 60",
      '30d': "M0 75 C 37 65, 75 55, 75 55 S 112 65, 150 65 S 187 45, 225 45 S 262 55, 300 55"
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative overflow-hidden">
      <header className="shrink-0 px-6 py-12 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100 shadow-sm">
        <button onClick={() => onNavigate(View.HOME)} className="p-2 -ml-2 text-slate-600 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-base font-bold">健康看板</h1>
        <button onClick={handleRefresh} className="p-2 -mr-2 text-slate-600 active:rotate-180 transition-all duration-500">
          <span className={`material-symbols-outlined text-xl ${isRefreshing ? 'animate-spin' : ''}`}>sync</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-32 space-y-6">
        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="https://i.pravatar.cc/150?u=elderly1" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="Profile" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">林奶奶</h2>
            <p className="text-[10px] text-slate-400 font-medium">
              数据同步于 {isRefreshing ? '正在更新...' : lastSyncTime}
            </p>
          </div>
        </div>

        {/* Warning Alert */}
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-red-500 fill-icon animate-pulse">warning</span>
          <div>
            <h3 className="text-sm font-bold text-red-800">血压异常警报</h3>
            <p className="text-xs text-red-600 mt-1">检测到读数高于日常基准 (145/95 mmHg)，请叮嘱长辈注意休息。</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 font-bold mb-2">平均心率</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800">72</span>
              <span className="text-[10px] text-slate-400">BPM</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-full w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[9px] font-bold">正常</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 font-bold mb-2">当前血压</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-red-500">145/95</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-full w-fit">
              <span className="material-symbols-outlined text-[10px] fill-icon">trending_up</span>
              <span className="text-[9px] font-bold">偏高</span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">变化趋势</h3>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              <button 
                onClick={() => setRange('7d')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${range === '7d' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
              >7 天</button>
              <button 
                onClick={() => setRange('30d')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${range === '30d' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
              >30 天</button>
            </div>
          </div>

          {/* Chart Cards */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-primary rounded-full"></div>
                <span className="text-xs font-bold text-slate-700">血压走向</span>
              </div>
              <span className="text-[9px] text-slate-400 font-bold">mmHg</span>
            </div>
            <div className="relative h-32 w-full">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100" onMouseMove={(e) => handleMouseMove(e, 'bp')}>
                <path d={chartPaths.bp[range]} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-500" />
                {bpTooltip.show && (
                  <>
                    <line x1={bpTooltip.x} y1="0" x2={bpTooltip.x} y2="100" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4" />
                    <circle cx={bpTooltip.x} cy={range === '7d' ? bpData['7d'].find(p => p.x === bpTooltip.x)?.y : bpData['30d'].find(p => p.x === bpTooltip.x)?.y} r="4" fill="#3B82F6" stroke="white" strokeWidth="2" />
                  </>
                )}
              </svg>
              {bpTooltip.show && (
                <div className="absolute top-0 transform -translate-x-1/2 -translate-y-6 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded shadow-lg" style={{ left: `${(bpTooltip.x / 300) * 100}%` }}>
                  {bpTooltip.val}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-xs font-bold text-slate-700">心率趋势</span>
              </div>
              <span className="text-[9px] text-slate-400 font-bold">BPM</span>
            </div>
            <div className="relative h-32 w-full">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100" onMouseMove={(e) => handleMouseMove(e, 'hr')}>
                <path d={chartPaths.hr[range]} fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-500" />
                {hrTooltip.show && (
                  <>
                    <line x1={hrTooltip.x} y1="0" x2={hrTooltip.x} y2="100" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4" />
                    <circle cx={hrTooltip.x} cy={range === '7d' ? hrData['7d'].find(p => p.x === hrTooltip.x)?.y : hrData['30d'].find(p => p.x === hrTooltip.x)?.y} r="4" fill="#F43F5E" stroke="white" strokeWidth="2" />
                  </>
                )}
              </svg>
              {hrTooltip.show && (
                <div className="absolute top-0 transform -translate-x-1/2 -translate-y-6 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded shadow-lg" style={{ left: `${(hrTooltip.x / 300) * 100}%` }}>
                  {hrTooltip.val}
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
