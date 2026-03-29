import React, { useEffect, useMemo, useRef, useState } from 'react';
import BottomNav from '../components/BottomNav';
import AssistantAvatar3D, { type AssistantAvatarStatus } from '../components/AssistantAvatar3D';
import AssistantChatSheet from '../components/AssistantChatSheet';
import { ASSISTANT_SUGGESTIONS } from '../components/assistantData';
import { storage } from '../lib/storage';
import { appDataService } from '../services/appDataService';
import { ensureAssistantSession, sendAssistantMessage } from '../services/assistantService';
import type { AssistantMessage, Organization } from '../types';
import { View } from '../types';

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
const EDGE_GAP = 10;
const BOTTOM_NAV_SAFE = 108;
const MIN_TOP = 96;
const DRAG_THRESHOLD = 8;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getDefaultAssistantPosition = (): AssistantPosition => ({
  x: Math.max(EDGE_GAP, window.innerWidth - FLOAT_WIDTH - EDGE_GAP),
  y: Math.max(MIN_TOP, window.innerHeight - FLOAT_HEIGHT - BOTTOM_NAV_SAFE),
});

const Home: React.FC<HomeProps> = ({ onSelectOrg, onNavigate, onShowToast }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantStatus, setAssistantStatus] = useState<AssistantAvatarStatus>('loading');
  const [assistantPosition, setAssistantPosition] = useState<AssistantPosition | null>(null);
  const [assistantSessionId, setAssistantSessionId] = useState<string | null>(storage.getAssistantSessionId());
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantSending, setAssistantSending] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [lastPendingPrompt, setLastPendingPrompt] = useState<string | null>(null);
  const dragStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadOrganizations = async () => {
      try {
        const result = await appDataService.listInstitutions();
        if (!cancelled) {
          setOrganizations(result);
        }
      } catch (error) {
        if (!cancelled) {
          onShowToast('机构数据加载失败，请稍后重试');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void loadOrganizations();
    return () => {
      cancelled = true;
    };
  }, [onShowToast]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = storage.getAssistantPosition<AssistantPosition>();
    if (stored) {
      const maxX = Math.max(EDGE_GAP, window.innerWidth - FLOAT_WIDTH - EDGE_GAP);
      const maxY = Math.max(MIN_TOP, window.innerHeight - FLOAT_HEIGHT - BOTTOM_NAV_SAFE);
      setAssistantPosition({
        x: clamp(stored.x, EDGE_GAP, maxX),
        y: clamp(stored.y, MIN_TOP, maxY),
      });
      return;
    }
    setAssistantPosition(getDefaultAssistantPosition());
  }, []);

  useEffect(() => {
    if (!assistantPosition || typeof window === 'undefined') return;
    const handleResize = () => {
      const maxX = Math.max(EDGE_GAP, window.innerWidth - FLOAT_WIDTH - EDGE_GAP);
      const maxY = Math.max(MIN_TOP, window.innerHeight - FLOAT_HEIGHT - BOTTOM_NAV_SAFE);
      const next = {
        x: clamp(assistantPosition.x, EDGE_GAP, maxX),
        y: clamp(assistantPosition.y, MIN_TOP, maxY),
      };
      setAssistantPosition(next);
      storage.setAssistantPosition(next);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [assistantPosition]);

  const filterTags = useMemo(() => {
    const dynamicTags = Array.from(new Set(organizations.flatMap((org) => org.tags))).slice(0, 4);
    return [ALL_FILTER, ...dynamicTags];
  }, [organizations]);

  const filteredOrgs = useMemo(() => {
    let result = [...organizations];
    if (searchQuery.trim()) {
      const keyword = searchQuery.trim();
      result = result.filter((org) => org.name.includes(keyword) || org.tags.some((tag) => tag.includes(keyword)));
    }
    if (activeFilter !== ALL_FILTER) {
      result = result.filter((org) => org.tags.includes(activeFilter));
    }
    return result;
  }, [organizations, searchQuery, activeFilter]);

  const toggleFavorite = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    const isFavorite = favorites.includes(id);
    if (isFavorite) {
      setFavorites((current) => current.filter((favoriteId) => favoriteId !== id));
      onShowToast('已取消收藏');
    } else {
      setFavorites((current) => [...current, id]);
      onShowToast('已加入收藏');
    }
  };

  const openAssistant = async () => {
    setAssistantOpen(true);
    setAssistantError(null);
    if (assistantSessionId && assistantMessages.length > 0) {
      return;
    }

    try {
      const result = await ensureAssistantSession();
      setAssistantSessionId(result.session.id);
      setAssistantMessages(result.messages);
    } catch (error) {
      setAssistantError('对话初始化失败，请确认本地后端服务已经启动。');
    }
  };

  const closeAssistant = () => {
    setAssistantOpen(false);
    setAssistantInput('');
    setAssistantError(null);
  };

  const handleSendAssistantMessage = async (content?: string) => {
    const finalContent = (content ?? assistantInput).trim();
    if (!finalContent || assistantSending) {
      return;
    }

    setAssistantError(null);
    setLastPendingPrompt(finalContent);
    setAssistantInput('');

    let sessionId = assistantSessionId;
    if (!sessionId) {
      try {
        const result = await ensureAssistantSession();
        sessionId = result.session.id;
        setAssistantSessionId(result.session.id);
        setAssistantMessages(result.messages);
      } catch (error) {
        setAssistantError('对话初始化失败，请稍后重试。');
        return;
      }
    }

    const optimisticUserMessage: AssistantMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: finalContent,
      created_at: new Date().toISOString(),
    };

    setAssistantMessages((current) => [...current, optimisticUserMessage]);
    setAssistantSending(true);

    try {
      const reply = await sendAssistantMessage(sessionId, finalContent);
      setAssistantMessages((current) => [...current, reply]);
      setLastPendingPrompt(null);
    } catch (error) {
      setAssistantError(error instanceof Error ? error.message : '发送失败，请稍后再试。');
    } finally {
      setAssistantSending(false);
    }
  };

  const handleRetryAssistant = () => {
    if (!lastPendingPrompt) return;
    void handleSendAssistantMessage(lastPendingPrompt);
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
    if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
      dragState.moved = true;
    }

    const maxX = Math.max(EDGE_GAP, window.innerWidth - FLOAT_WIDTH - EDGE_GAP);
    const maxY = Math.max(MIN_TOP, window.innerHeight - FLOAT_HEIGHT - BOTTOM_NAV_SAFE);
    setAssistantPosition({
      x: clamp(dragState.originX + deltaX, EDGE_GAP, maxX),
      y: clamp(dragState.originY + deltaY, MIN_TOP, maxY),
    });
  };

  const finalizeAssistantDrag = (position: AssistantPosition) => {
    const centerX = position.x + FLOAT_WIDTH / 2;
    const snapLeft = centerX < window.innerWidth / 2;
    const maxX = Math.max(EDGE_GAP, window.innerWidth - FLOAT_WIDTH - EDGE_GAP);
    const maxY = Math.max(MIN_TOP, window.innerHeight - FLOAT_HEIGHT - BOTTOM_NAV_SAFE);
    const nextPosition = {
      x: snapLeft ? EDGE_GAP : maxX,
      y: clamp(position.y, MIN_TOP, maxY),
    };
    setAssistantPosition(nextPosition);
    storage.setAssistantPosition(nextPosition);
  };

  const handleAssistantPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStartRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    dragStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!dragState.moved) {
      void openAssistant();
      return;
    }

    if (assistantPosition) {
      finalizeAssistantDrag(assistantPosition);
    }
  };

  const handleAssistantPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStartRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    dragStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (assistantPosition) {
      finalizeAssistantDrag(assistantPosition);
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
          <h1 className="text-lg font-bold">寻找照护机构</h1>
          <button
            className="rounded-full p-2 transition-colors hover:bg-slate-200"
            onClick={() => onShowToast('地图模式准备中')}
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
            placeholder="按机构名或服务标签搜索"
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
          {loading && (
            <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-400 shadow-sm">正在加载机构列表…</div>
          )}

          {!loading &&
            filteredOrgs.map((org) => (
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
                      <span className="text-[10px] font-bold text-green-600">剩余床位: {org.beds}</span>
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
                    {org.beds > 0 ? `当前可预约床位 ${org.beds}` : '当前床位紧张，支持排队登记'}
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
                      <span className="text-lg">{org.price.toLocaleString()}</span>
                      <span className="text-sm">元</span>
                      <span className="text-xs font-normal text-slate-400">/月起</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {!loading && filteredOrgs.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-20 text-center text-slate-400">
              <span className="material-symbols-outlined text-5xl opacity-20">search_off</span>
              <p>没有找到匹配的照护机构</p>
            </div>
          )}
        </div>
      </main>

      {assistantPosition && (
        <div
          className="fixed z-[55] h-[132px] w-[108px] select-none transition-[left,top] duration-200"
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
            onOpen={() => {}}
            onStatusChange={setAssistantStatus}
          />
        </div>
      )}

      <AssistantChatSheet
        open={assistantOpen}
        onClose={closeAssistant}
        messages={assistantMessages}
        suggestions={ASSISTANT_SUGGESTIONS}
        inputValue={assistantInput}
        onInputChange={setAssistantInput}
        onSend={(content) => {
          void handleSendAssistantMessage(content);
        }}
        loading={assistantSending}
        errorMessage={assistantError}
        onRetry={lastPendingPrompt ? handleRetryAssistant : undefined}
      />

      <BottomNav activeView={View.HOME} onNavigate={onNavigate} />
    </div>
  );
};

export default Home;
