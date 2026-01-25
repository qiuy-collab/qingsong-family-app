
import React from 'react';
import { View } from '../types';

interface BottomNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { view: View.HOME, label: '首页', icon: 'home' },
    { view: View.HEALTH, label: '数据', icon: 'bar_chart' },
    { view: View.DYNAMIC, label: '动态', icon: 'explore' },
    { view: View.SERVICE, label: '服务', icon: 'medical_services' },
    { view: View.PROFILE, label: '我的', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-slate-100 flex justify-around items-center pt-2 pb-6 z-50">
      {navItems.map((item) => (
        <button
          key={item.view}
          onClick={() => onNavigate(item.view)}
          className={`flex flex-col items-center gap-1 w-1/5 transition-colors ${
            activeView === item.view ? 'text-primary' : 'text-slate-400'
          }`}
        >
          <span className={`material-symbols-outlined ${activeView === item.view ? 'fill-icon' : ''}`}>
            {item.icon}
          </span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
