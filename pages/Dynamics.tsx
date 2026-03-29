import React, { useEffect, useMemo, useRef, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { storage } from '../lib/storage';
import { appDataService } from '../services/appDataService';
import type { AuthProfile, DynamicItem } from '../types';
import { View } from '../types';

interface DynamicsProps {
  onNavigate: (view: View, params?: Record<string, unknown>) => void;
  onShowToast: (message: string) => void;
}

const Dynamics: React.FC<DynamicsProps> = ({ onNavigate, onShowToast }) => {
  const elderId = useMemo(() => {
    const profile = storage.getProfile<AuthProfile>();
    return profile?.default_elder_id ?? 'e1234567-e89b-12d3-a456-426614174000';
  }, []);

  const [dynamics, setDynamics] = useState<DynamicItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'diet' | 'activity'>('all');
  const [isCalling, setIsCalling] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  const commentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await appDataService.listDynamics(elderId);
        if (!cancelled) {
          setDynamics(result);
        }
      } catch (error) {
        if (!cancelled) {
          onShowToast('长辈动态加载失败');
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [elderId, onShowToast]);

  const sortedAndFilteredDynamics = useMemo(() => {
    let list = [...dynamics];
    if (activeFilter !== 'all') {
      list = list.filter((item) => item.type === activeFilter);
    }
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [dynamics, activeFilter]);

  const toggleLike = async (id: string) => {
    try {
      const result = await appDataService.toggleDynamicLike(id);
      setDynamics((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                is_liked: result.is_liked,
                likes: result.likes,
              }
            : item,
        ),
      );
    } catch (error) {
      onShowToast('点赞失败，请稍后重试');
    }
  };

  const toggleComments = (id: string) => {
    setDynamics((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const nextShow = !(item as DynamicItem & { showComments?: boolean }).showComments;
        if (nextShow) {
          window.setTimeout(() => {
            commentInputRefs.current[id]?.focus();
          }, 250);
        }
        return { ...item, showComments: nextShow } as DynamicItem & { showComments?: boolean };
      }) as DynamicItem[],
    );
  };

  const handleAddComment = async (id: string) => {
    const text = newComment[id]?.trim();
    if (!text) return;

    try {
      const comment = await appDataService.addDynamicComment(id, text);
      setDynamics((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                comments: [...item.comments, comment],
              }
            : item,
        ),
      );
      setNewComment((current) => ({ ...current, [id]: '' }));
      onShowToast('评论已发表');
    } catch (error) {
      onShowToast('评论发送失败');
    }
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-50">
      <header className="z-30 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 pb-4 pt-12">
        <button onClick={() => onNavigate(View.HOME)} className="p-2 text-slate-600 active:scale-90">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-base font-bold">长辈动态</h1>
        <button className="p-2 text-slate-600" onClick={() => onShowToast('筛选设置准备中')}>
          <span className="material-symbols-outlined text-xl">tune</span>
        </button>
      </header>

      <main className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-4 pb-24 pt-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?u=elderly1" className="h-12 w-12 rounded-full object-cover" alt="Profile" />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">林奶奶</h2>
                <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-600">状态良好</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">阳光花园 · 2 号楼 302</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsCalling(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">videocam</span>
              视频通话
            </button>
            <button
              onClick={() => setIsMessaging(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-sm font-bold text-slate-700 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
              给 TA 留言
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
          {[
            { id: 'all', label: '全部', icon: 'grid_view' },
            { id: 'diet', label: '饮食', icon: 'restaurant' },
            { id: 'activity', label: '活动', icon: 'auto_awesome' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as 'all' | 'diet' | 'activity')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                activeFilter === filter.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-500'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {sortedAndFilteredDynamics.map((item) => {
            const showComments = (item as DynamicItem & { showComments?: boolean }).showComments;
            return (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          item.type === 'diet' ? 'bg-orange-50 text-orange-600' : 'bg-primary/5 text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {item.type === 'diet' ? 'restaurant' : 'self_improvement'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                        <p className="text-[10px] text-slate-400">
                          {item.time} · {item.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mb-3 text-sm leading-relaxed text-slate-600">{item.content}</p>

                  {item.image && (
                    <div className="mb-3 aspect-video overflow-hidden rounded-xl bg-slate-50">
                      <img src={item.image} className="h-full w-full object-cover" alt="Dynamic" />
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => void toggleLike(item.id)}
                        className={`flex items-center gap-1.5 transition-all ${
                          item.is_liked ? 'text-pink-500' : 'text-slate-400'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-xl ${item.is_liked ? 'fill-icon' : ''}`}>
                          favorite
                        </span>
                        <span className="text-xs font-bold">{item.likes}</span>
                      </button>
                      <button
                        onClick={() => toggleComments(item.id)}
                        className={`flex items-center gap-1.5 transition-all ${
                          showComments ? 'text-primary' : 'text-slate-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">chat_bubble</span>
                        <span className="text-xs font-bold">{item.comments.length}</span>
                      </button>
                    </div>
                    <button onClick={() => onShowToast('分享链接已复制')} className="text-slate-400 active:text-primary">
                      <span className="material-symbols-outlined text-xl">share</span>
                    </button>
                  </div>
                </div>

                {showComments && (
                  <div className="space-y-3 border-t border-slate-100 bg-slate-50/50 p-4">
                    <div className="space-y-3">
                      {item.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <img src={`https://i.pravatar.cc/100?u=${comment.user}`} className="h-6 w-6 rounded-full" alt="User" />
                          <div className="flex-1">
                            <div className="mb-0.5 flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700">{comment.user}</span>
                              <span className="text-[9px] text-slate-400">{comment.time}</span>
                            </div>
                            <p className="text-xs text-slate-600">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <input
                        ref={(element) => {
                          commentInputRefs.current[item.id] = element;
                        }}
                        type="text"
                        value={newComment[item.id] || ''}
                        onChange={(event) => setNewComment((current) => ({ ...current, [item.id]: event.target.value }))}
                        onKeyDown={(event) => event.key === 'Enter' && void handleAddComment(item.id)}
                        placeholder="写点什么…"
                        className="h-9 flex-1 rounded-lg border-slate-200 bg-white px-3 text-xs focus:border-primary focus:ring-primary"
                      />
                      <button
                        onClick={() => void handleAddComment(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white active:scale-90"
                      >
                        <span className="material-symbols-outlined text-sm">send</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {isMessaging && (
        <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 px-6 backdrop-blur-sm duration-300">
          <div className="animate-in zoom-in-95 w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold">给 TA 留言</h3>
              <button onClick={() => setIsMessaging(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <textarea
              rows={4}
              autoFocus
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="请输入您想说的话…"
              className="mb-4 w-full resize-none rounded-xl border-slate-100 bg-slate-50 p-3 text-sm focus:border-primary focus:ring-primary"
            />
            <button
              onClick={() => {
                if (messageText.trim()) {
                  onShowToast('留言已发送');
                  setMessageText('');
                  setIsMessaging(false);
                }
              }}
              className="w-full rounded-xl bg-primary py-3 font-bold text-white transition-transform active:scale-95"
            >
              发送留言
            </button>
          </div>
        </div>
      )}

      {isCalling && (
        <div className="animate-in fade-in fixed inset-0 z-[200] flex flex-col justify-between overflow-hidden bg-slate-950 px-8 py-16 duration-500">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl" />
              <img src="https://i.pravatar.cc/300?u=elderly1" className="relative z-10 h-32 w-32 rounded-full border-4 border-slate-900 object-cover" alt="Grandma" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">正在呼叫林奶奶</h2>
            <p className="animate-pulse text-sm font-medium uppercase tracking-widest text-primary">Calling…</p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {[
              ['mic_off', '静音'],
              ['videocam_off', '摄像头'],
              ['volume_up', '免提'],
            ].map(([icon, label]) => (
              <div key={label} className="flex flex-col items-center gap-2 opacity-50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <span className="text-[10px] text-white/50">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={() => setIsCalling(false)}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all active:scale-90 active:bg-red-600"
            >
              <span className="material-symbols-outlined fill-icon text-4xl">call_end</span>
            </button>
            <p className="mt-4 text-xs text-white/30">挂断</p>
          </div>
        </div>
      )}

      <BottomNav activeView={View.DYNAMIC} onNavigate={onNavigate} />
    </div>
  );
};

export default Dynamics;
