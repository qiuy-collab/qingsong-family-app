
import React, { useState, useMemo, useRef } from 'react';
import { View } from '../types';
import BottomNav from '../components/BottomNav';

interface DynamicsProps {
  onNavigate: (view: View, params?: any) => void;
  onShowToast: (message: string) => void;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  time: string;
  timestamp: number;
}

interface DynamicItem {
  id: string;
  type: 'diet' | 'activity' | 'health';
  time: string;
  timestamp: number;
  title: string;
  location: string;
  content: string;
  image?: string;
  isLiked: boolean;
  likes: number;
  comments: Comment[];
  showComments?: boolean;
}

const INITIAL_DYNAMICS: DynamicItem[] = [
  {
    id: '1',
    type: 'diet',
    time: '12:30',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
    title: '午餐记录',
    location: 'B 餐厅',
    content: '林奶奶今天胃口不错，食用了 90% 的午餐（蔬菜炒肉和米饭）。',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop',
    isLiked: false,
    likes: 12,
    comments: [
      { id: 'c1', user: '张护工', text: '今天特意加了一份软糯的南瓜。', time: '12:45', timestamp: Date.now() - 1000 * 60 * 60 * 1.5 }
    ]
  },
  {
    id: '2',
    type: 'activity',
    time: '10:00',
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4小时前
    title: '晨间太极',
    location: '花园区',
    content: '参加了社区组织的晨间太极活动，表现非常积极，平衡力有所提升。',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
    isLiked: true,
    likes: 24,
    comments: []
  },
  {
    id: '3',
    type: 'activity',
    time: '昨天 15:00',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1天前
    title: '书法练习',
    location: '文化活动室',
    content: '奶奶今天练习了一个小时的书法，写了几个“平安”大字。',
    image: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=800&auto=format&fit=crop',
    isLiked: false,
    likes: 8,
    comments: []
  }
];

const Dynamics: React.FC<DynamicsProps> = ({ onNavigate, onShowToast }) => {
  const [dynamics, setDynamics] = useState<DynamicItem[]>(INITIAL_DYNAMICS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'diet' | 'activity'>('all');
  const [isCalling, setIsCalling] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  
  const commentInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // 1. 动态排序逻辑：按时间戳降序
  const sortedAndFilteredDynamics = useMemo(() => {
    let list = [...dynamics];
    if (activeFilter !== 'all') {
      list = list.filter(item => item.type === activeFilter);
    }
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [dynamics, activeFilter]);

  const toggleLike = (id: string) => {
    setDynamics(prev => prev.map(item => {
      if (item.id === id) {
        const nextLiked = !item.isLiked;
        return { 
          ...item, 
          isLiked: nextLiked, 
          likes: nextLiked ? item.likes + 1 : item.likes - 1 
        };
      }
      return item;
    }));
  };

  const toggleComments = (id: string) => {
    setDynamics(prev => prev.map(item => {
      if (item.id === id) {
        const nextShow = !item.showComments;
        if (nextShow) {
          setTimeout(() => {
            commentInputRefs.current[id]?.focus();
          }, 300);
        }
        return { ...item, showComments: nextShow };
      }
      return item;
    }));
  };

  const handleAddComment = (id: string) => {
    const text = newComment[id];
    if (!text?.trim()) return;

    setDynamics(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          comments: [
            ...item.comments,
            { id: Date.now().toString(), user: '我', text, time: '刚刚', timestamp: Date.now() }
          ]
        };
      }
      return item;
    }));
    setNewComment(prev => ({ ...prev, [id]: '' }));
    onShowToast('评论已发表');
  };

  const handleShare = () => {
    onShowToast('已复制分享链接');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative overflow-hidden">
      {/* 头部固定 */}
      <header className="shrink-0 bg-white border-b border-slate-100 px-4 pt-12 pb-4 flex items-center justify-between z-30">
        <button onClick={() => onNavigate(View.HOME)} className="p-2 text-slate-600 active:scale-90">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-base font-bold">长辈动态</h1>
        <button className="p-2 text-slate-600" onClick={() => onShowToast('筛选设置')}>
          <span className="material-symbols-outlined text-xl">tune</span>
        </button>
      </header>

      {/* 主内容区：可滚动 */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24 pt-4 space-y-4">
        {/* 个人资料卡片 - 调整为正常尺寸 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?u=elderly1" className="w-12 h-12 rounded-full object-cover" alt="Profile" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">林奶奶</h2>
                <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded font-bold">状态良好</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">阳光花园 · 2号楼302</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setIsCalling(true)}
              className="flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-bold active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg">videocam</span>
              视频通话
            </button>
            <button 
              onClick={() => setIsMessaging(true)}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
              给TA留言
            </button>
          </div>
        </div>

        {/* 过滤标签 */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: '全部', icon: 'grid_view' },
            { id: 'diet', label: '饮食', icon: 'restaurant' },
            { id: 'activity', label: '活动', icon: 'auto_awesome' }
          ].map(filter => (
            <button 
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${activeFilter === filter.id ? 'bg-primary text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200'}`}
            >
              <span className="material-symbols-outlined text-sm">{filter.icon}</span> {filter.label}
            </button>
          ))}
        </div>

        {/* 动态列表 */}
        <div className="space-y-4">
          {sortedAndFilteredDynamics.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'diet' ? 'bg-orange-50 text-orange-600' : 'bg-primary/5 text-primary'}`}>
                      <span className="material-symbols-outlined text-lg">{item.type === 'diet' ? 'restaurant' : 'self_improvement'}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                      <p className="text-[10px] text-slate-400">{item.time} · {item.location}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-3">{item.content}</p>
                
                {item.image && (
                  <div className="rounded-xl overflow-hidden aspect-video mb-3 bg-slate-50">
                    <img src={item.image} className="w-full h-full object-cover" alt="Dynamic" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleLike(item.id)}
                      className={`flex items-center gap-1.5 transition-all ${item.isLiked ? 'text-pink-500' : 'text-slate-400'}`}
                    >
                      <span className={`material-symbols-outlined text-xl ${item.isLiked ? 'fill-icon' : ''}`}>favorite</span>
                      <span className="text-xs font-bold">{item.likes}</span>
                    </button>
                    <button 
                      onClick={() => toggleComments(item.id)}
                      className={`flex items-center gap-1.5 transition-all ${item.showComments ? 'text-primary' : 'text-slate-400'}`}
                    >
                      <span className="material-symbols-outlined text-xl">chat_bubble</span>
                      <span className="text-xs font-bold">{item.comments.length}</span>
                    </button>
                  </div>
                  <button onClick={handleShare} className="text-slate-400 active:text-primary">
                    <span className="material-symbols-outlined text-xl">share</span>
                  </button>
                </div>
              </div>

              {/* 评论区 */}
              {item.showComments && (
                <div className="bg-slate-50/50 p-4 border-t border-slate-100 space-y-3">
                  <div className="space-y-3">
                    {item.comments.map(comment => (
                      <div key={comment.id} className="flex gap-2">
                        <img src={`https://i.pravatar.cc/100?u=${comment.user}`} className="w-6 h-6 rounded-full" alt="User" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-bold text-slate-700">{comment.user}</span>
                            <span className="text-[9px] text-slate-400">{comment.time}</span>
                          </div>
                          <p className="text-xs text-slate-600">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 items-center mt-2">
                    <input 
                      ref={(el) => { commentInputRefs.current[item.id] = el; }}
                      type="text" 
                      value={newComment[item.id] || ''}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [item.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(item.id)}
                      placeholder="写点什么..."
                      className="flex-1 h-9 bg-white border-slate-200 rounded-lg px-3 text-xs focus:ring-primary focus:border-primary"
                    />
                    <button 
                      onClick={() => handleAddComment(item.id)}
                      className="w-9 h-9 bg-primary text-white rounded-lg flex items-center justify-center active:scale-90"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* 留言弹窗：居中且高度自适应 */}
      {isMessaging && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold">给 TA 留言</h3>
              <button onClick={() => setIsMessaging(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <textarea 
              rows={4}
              autoFocus
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="请输入您想说的话..."
              className="w-full rounded-xl border-slate-100 bg-slate-50 p-3 text-sm focus:ring-primary focus:border-primary mb-4 resize-none"
            />
            <button 
              onClick={() => {
                if(messageText.trim()) {
                  onShowToast('留言已发送');
                  setMessageText('');
                  setIsMessaging(false);
                }
              }}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl active:scale-95 transition-transform"
            >
              发送留言
            </button>
          </div>
        </div>
      )}

      {/* 视频通话界面：自适应视口布局 */}
      {isCalling && (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col justify-between py-16 px-8 animate-in fade-in duration-500 overflow-hidden">
          {/* 顶部：长辈信息 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse"></div>
              <img 
                src="https://i.pravatar.cc/300?u=elderly1" 
                className="w-32 h-32 rounded-full border-4 border-slate-900 relative z-10 object-cover" 
                alt="Grandma" 
              />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">正在呼叫林奶奶</h2>
            <p className="text-primary text-sm font-medium animate-pulse uppercase tracking-widest">Calling...</p>
          </div>
          
          {/* 中部：控制按钮预览（此处可留空或增加占位） */}
          <div className="grid grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-2 opacity-50">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
                <span className="material-symbols-outlined">mic_off</span>
              </div>
              <span className="text-[10px] text-white/50">静音</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-50">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
                <span className="material-symbols-outlined">videocam_off</span>
              </div>
              <span className="text-[10px] text-white/50">摄像头</span>
            </div>
             <div className="flex flex-col items-center gap-2 opacity-50">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
                <span className="material-symbols-outlined">volume_up</span>
              </div>
              <span className="text-[10px] text-white/50">免提</span>
            </div>
          </div>

          {/* 底部：操作按钮 - 确保在视口底部 */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => setIsCalling(false)}
              className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 active:bg-red-600 transition-all"
            >
              <span className="material-symbols-outlined text-4xl fill-icon">call_end</span>
            </button>
            <p className="text-white/30 text-xs mt-4">挂断</p>
          </div>
        </div>
      )}

      <BottomNav activeView={View.DYNAMIC} onNavigate={onNavigate} />
    </div>
  );
};

export default Dynamics;
