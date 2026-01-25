
import React, { useState, useMemo } from 'react';
import { View } from '../types';
import { ORGANIZATIONS } from '../constants';
import BottomNav from '../components/BottomNav';

interface HomeProps {
  onSelectOrg: (id: string) => void;
  onNavigate: (view: View) => void;
  onShowToast: (msg: string) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectOrg, onNavigate, onShowToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('全部');
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredOrgs = useMemo(() => {
    let result = [...ORGANIZATIONS];
    if (searchQuery) {
      result = result.filter(o => o.name.includes(searchQuery) || o.tags.some(t => t.includes(searchQuery)));
    }
    if (activeFilter !== '全部') {
      result = result.filter(o => o.tags.includes(activeFilter));
    }
    return result;
  }, [searchQuery, activeFilter]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isFav = favorites.includes(id);
    if (isFav) {
      setFavorites(favorites.filter(fid => fid !== id));
      onShowToast('已取消收藏');
    } else {
      setFavorites([...favorites, id]);
      onShowToast('已加入收藏');
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <button className="p-2 hover:bg-slate-200 rounded-full transition-colors" onClick={() => onShowToast('返回功能暂不可用')}>
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h1 className="text-lg font-bold">寻找照护</h1>
        <button className="p-2 hover:bg-slate-200 rounded-full transition-colors" onClick={() => onShowToast('正在开启地图视图')}>
          <span className="material-symbols-outlined text-primary">map</span>
        </button>
      </header>

      <main className="flex-1 px-4 space-y-4">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-slate-400">search</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="按名称或地点搜索" 
            className="w-full bg-white border-none rounded-full py-3 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          {['全部', '专业护理', '医疗保险', '康复', '协助生活'].map(tag => (
            <button 
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === tag ? 'bg-primary text-white' : 'bg-white border border-slate-100 text-slate-500'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredOrgs.map(org => (
            <div 
              key={org.id} 
              onClick={() => onSelectOrg(org.id)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="relative h-48">
                <img src={org.image} alt={org.name} className="w-full h-full object-cover" />
                {org.beds > 0 ? (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-bold text-green-600">床位: {org.beds}</span>
                  </div>
                ) : org.status && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-orange-500">schedule</span>
                    <span className="text-[10px] font-bold text-orange-600">{org.status}</span>
                  </div>
                )}
                <button 
                  onClick={(e) => toggleFavorite(e, org.id)}
                  className={`absolute top-3 right-3 drop-shadow-md transition-colors ${favorites.includes(org.id) ? 'text-red-500' : 'text-white'}`}
                >
                  <span className={`material-symbols-outlined ${favorites.includes(org.id) ? 'fill-icon' : ''}`}>favorite</span>
                </button>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold">{org.name}</h3>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-yellow-500 text-xs fill-icon">star</span>
                    <span className="text-xs font-bold text-yellow-700">{org.rating}</span>
                    <span className="text-[10px] text-slate-400">({org.reviews})</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-3">{org.beds > 0 ? `床位: ${org.beds}` : '排队人数较多'}</p>
                <div className="flex gap-2 mb-4">
                  {org.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded font-medium">{tag}</span>
                  ))}
                </div>
                <hr className="border-slate-50 mb-3" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-slate-400 gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="text-xs">{org.distance}</span>
                  </div>
                  <div className="text-primary font-bold">
                    <span className="text-sm">¥</span><span className="text-lg">{org.price.toLocaleString()}</span><span className="text-xs text-slate-400 font-normal">/月</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredOrgs.length === 0 && (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-5xl opacity-20">search_off</span>
              <p>未找到匹配的照护机构</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav activeView={View.HOME} onNavigate={onNavigate} />
    </div>
  );
};

export default Home;
