import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from '../types';
import { ORGANIZATIONS } from '../constants';
import BottomNav from '../components/BottomNav';
import AssistantAvatar3D, { type AssistantAvatarStatus } from '../components/AssistantAvatar3D';
import AssistantChatSheet from '../components/AssistantChatSheet';
import { ASSISTANT_ITEMS } from '../components/assistantData';

interface HomeProps {
  onSelectOrg: (id: string) => void;
  onNavigate: (view: View) => void;
  onShowToast: (msg: string) => void;
}

interface AssistantPosition {
  x: number;
  y: number;
}

const ALL_FILTER = '全部';
const FLOAT_WIDTH = 108;
const FLOAT_HEIGHT = 132;
const EDGE_GAP = 8;
const BOTTOM_NAV_SAFE = 106;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const Home: React.FC<HomeProps> = ({ onSelectOrg, onNavigate, onShowToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);
  const [assistantStatus, setAssistantStatus] = useState<AssistantAvatarStatus>('loading');
  const [assistantPosition, setAssistantPosition] = useState<AssistantPosition | null>(null);
  const dragStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const filterTags = useMemo(() => {
    const dynamicTags = Array.from(new Set(ORGANIZATIONS.flatMap((org) => org.tags))).slice(0, 4);
    return [ALL_FILTER, ...dynamicTags];
  }, []);

  const filteredOrgs = useMemo(() => {
    let result = [...ORGANIZATIONS];
    if (searchQuery) {
      result = result.filter((org) => org.name.includes(searchQuery) || org.tags.some((tag) => tag.includes(searchQuery)));
    }
    if (activeFilter !== ALL_FILTER) {
      result = result.filter((org) => org.tags.includes(activeFilter));
    }
    return result;
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    if (assistantPosition) return;
    if (typeof window === 'undefined') return;

    const initialX = window.innerWidth - FLOAT_WIDTH - EDGE_GAP;
    const initialY = window.innerHeight - FLOAT_HEIGHT - BOTTOM_NAV_SAFE;
    setAssistantPosition({ x: Math.max(EDGE_GAP, initialX), y: Math.max(80, initialY) });
  }, [assistantPosition]);

  const toggleFavorite = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    const isFavorite = favorites.includes(id);
    if (isFavorite) {
      setFavorites(favorites.filter((favoriteId) => favoriteId !== id));
      onShowToast('已取消收藏');
    } else {
      setFavorites([...favorites, id]);
      onShowToast('已加入收藏');
    }
  };

  const closeAssistant = () => {
    setAssistantOpen(false);
    setSelectedAssistantId(null);
  };

  const handleAssistantPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!assistantPosition) return;

    dragStartRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: assistantPosition.x,
      originY: assistantPosition.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleAssistantPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStartRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      dragState.moved = true;
    }

    const maxX = Math.max(EDGE_GAP, window.innerWidth - FLOAT_WIDTH - EDGE_GAP);
    const maxY = Math.max(80, window.innerHeight - FLOAT_HEIGHT - BOTTOM_NAV_SAFE);
    setAssistantPosition({
      x: clamp(dragState.originX + deltaX, EDGE_GAP, maxX),
      y: clamp(dragState.originY + deltaY, 80, maxY),
    });
  };

  const handleAssistantPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStartRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    dragStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!dragState.moved) {
      setAssistantOpen(true);
    }
  };

  const handleAssistantPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStartRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    dragStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col pb-24">
      <header className="sticky top-0 z-50 bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            className="rounded-full p-2 transition-colors hover:bg-slate-200"
            onClick={() => onShowToast('返回功能暂不可用')}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h1 className="text-lg font-bold">寻找照护</h1>
          <button
            className="rounded-full p-2 transition-colors hover:bg-slate-200"
            onClick={() => onShowToast('正在打开地图视图')}
          >
            <span className="material-symbols-outlined text-primary">map</span>
          </button>
        </div>
      </header>

      <main className="flex-1 space-y-4 px-4">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-slate-400">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="按名称或地点搜索"
            className="w-full rounded-full border-none bg-white py-3 pl-12 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`whitespace-nowrap rounded-full px-5 py-1.5 text-sm font-medium transition-all ${
                activeFilter === tag ? 'bg-primary text-white' : 'border border-slate-100 bg-white text-slate-500'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredOrgs.map((org) => (
            <div
              key={org.id}
              onClick={() => onSelectOrg(org.id)}
              className="cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-transform active:scale-[0.98]"
            >
              <div className="relative h-48">
                <img src={org.image} alt={org.name} className="h-full w-full object-cover" />
                {org.beds > 0 ? (
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold text-green-600">床位: {org.beds}</span>
                  </div>
                ) : org.status ? (
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-xs text-orange-500">schedule</span>
                    <span className="text-[10px] font-bold text-orange-600">{org.status}</span>
                  </div>
                ) : null}

                <button
                  onClick={(event) => toggleFavorite(event, org.id)}
                  className={`absolute right-3 top-3 drop-shadow-md transition-colors ${
                    favorites.includes(org.id) ? 'text-red-500' : 'text-white'
                  }`}
                  aria-label={favorites.includes(org.id) ? '取消收藏' : '加入收藏'}
                >
                  <span className={`material-symbols-outlined ${favorites.includes(org.id) ? 'fill-icon' : ''}`}>
                    favorite
                  </span>
                </button>
              </div>

              <div className="p-4">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold">{org.name}</h3>
                  <div className="flex items-center gap-1 rounded-md bg-yellow-50 px-2 py-0.5">
                    <span className="material-symbols-outlined fill-icon text-xs text-yellow-500">star</span>
                    <span className="text-xs font-bold text-yellow-700">{org.rating}</span>
                    <span className="text-[10px] text-slate-400">({org.reviews})</span>
                  </div>
                </div>

                <p className="mb-3 text-xs text-slate-500">
                  {org.beds > 0 ? `床位: ${org.beds}` : '当前排队人数较多'}
                </p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {org.tags.map((tag) => (
                    <span key={tag} className="rounded bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-600">
                      {tag}
                    </span>
                  ))}
                </div>

                <hr className="mb-3 border-slate-50" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="text-xs">{org.distance}</span>
                  </div>
                  <div className="font-bold text-primary">
                    <span className="text-sm">¥</span>
                    <span className="text-lg">{org.price.toLocaleString()}</span>
                    <span className="text-xs font-normal text-slate-400">/月</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredOrgs.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-20 text-center text-slate-400">
              <span className="material-symbols-outlined text-5xl opacity-20">search_off</span>
              <p>未找到匹配的照护机构</p>
            </div>
          )}
        </div>
      </main>

      {assistantPosition && (
        <div
          className="fixed z-[55] h-[132px] w-[108px] select-none"
          style={{ left: assistantPosition.x, top: assistantPosition.y, touchAction: 'none' }}
          onPointerDown={handleAssistantPointerDown}
          onPointerMove={handleAssistantPointerMove}
          onPointerUp={handleAssistantPointerUp}
          onPointerCancel={handleAssistantPointerCancel}
        >
          <div className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900/90 px-3 py-1 text-[10px] font-bold text-white shadow-lg">
            {assistantStatus === 'fallback' ? '点击打开' : '点我咨询'}
          </div>
          <AssistantAvatar3D
            active={assistantOpen}
            onOpen={() => setAssistantOpen(true)}
            onStatusChange={setAssistantStatus}
          />
        </div>
      )}

      <AssistantChatSheet
        open={assistantOpen}
        onClose={closeAssistant}
        items={ASSISTANT_ITEMS}
        selectedId={selectedAssistantId}
        onSelect={setSelectedAssistantId}
      />

      <BottomNav activeView={View.HOME} onNavigate={onNavigate} />
    </div>
  );
};

export default Home;
