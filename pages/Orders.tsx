
import React, { useState } from 'react';
import { View, Order } from '../types';

interface OrdersProps {
  onNavigate: (view: View) => void;
  onShowToast: (msg: string) => void;
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-20231012-001',
    serviceName: '基础生活照护',
    orgName: '阳光花园养老生活',
    price: 5000,
    date: '2023-10-12',
    status: 'active',
    type: 'base'
  },
  {
    id: 'ORD-20231012-002',
    serviceName: '康复进阶包',
    orgName: '阳光花园养老生活',
    price: 1500,
    date: '2023-10-12',
    status: 'active',
    type: 'pro'
  }
];

const Orders: React.FC<OrdersProps> = ({ onNavigate, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const filteredOrders = MOCK_ORDERS.filter(o => 
    activeTab === 'all' || o.status === activeTab
  );

  const handleReview = () => {
    if (rating === 0) {
      onShowToast('请先选择评分');
      return;
    }
    onShowToast('评价已提交，感谢您的反馈');
    setShowReview(false);
    setRating(0);
    setComment('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-12">
      <header className="sticky top-0 z-50 bg-white px-4 py-4 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => onNavigate(View.PROFILE)} className="p-2 -ml-2 active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
        </button>
        <h1 className="text-lg font-bold">我的签约服务</h1>
        <button onClick={() => onShowToast('帮助文档加载中...')} className="p-2 -mr-2 text-slate-400">
          <span className="material-symbols-outlined text-xl">help_outline</span>
        </button>
      </header>

      {/* Tab Switcher */}
      <div className="bg-white px-6 pt-2 pb-4 flex gap-8 border-b border-slate-50">
        {(['全部', '履行中', '已完成'] as const).map((label, idx) => {
          const tab = (['all', 'active', 'completed'] as const)[idx];
          return (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-bold relative pb-2 transition-colors ${activeTab === tab ? 'text-primary' : 'text-slate-400'}`}
            >
              {label}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in slide-in-from-left duration-300"></div>
              )}
            </button>
          );
        })}
      </div>

      <main className="px-4 pt-6 space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.type === 'pro' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-primary'}`}>
                      <span className="material-symbols-outlined fill-icon text-2xl">
                        {order.type === 'pro' ? 'fitness_center' : 'home_work'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{order.serviceName}</h3>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        {order.orgName}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${order.status === 'active' ? 'bg-green-50 text-green-500' : 'bg-slate-50 text-slate-400'}`}>
                    {order.status === 'active' ? '履行中' : '已完成'}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 flex justify-between items-center mb-5">
                  <div className="text-[10px] text-slate-400">
                    订单号: <span className="font-mono text-slate-600 ml-1">{order.id}</span>
                  </div>
                  <div className="text-primary font-black text-base">
                    ¥{order.price.toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => onShowToast('正在为您连线机构客服...')}
                    className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">support_agent</span>
                    联系客服
                  </button>
                  <button 
                    onClick={() => setShowReview(true)}
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/20"
                  >
                    <span className="material-symbols-outlined text-sm">rate_review</span>
                    评价服务
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center gap-4 text-slate-300">
            <span className="material-symbols-outlined text-6xl opacity-20">receipt_long</span>
            <p className="font-bold text-sm">暂无相关订单记录</p>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-6 animate-in fade-in duration-300">
          <div className="w-full max-sm:max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mb-4">
                   <span className="material-symbols-outlined text-3xl fill-icon">star</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">评价您的服务</h3>
                <p className="text-xs text-slate-400 mb-6">您的意见将帮助我们提供更好的照护</p>
                
                <div className="flex gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      onClick={() => setRating(star)}
                      className={`transition-all ${rating >= star ? 'text-yellow-400 scale-110' : 'text-slate-200 hover:text-yellow-100'}`}
                    >
                      <span className={`material-symbols-outlined text-3xl ${rating >= star ? 'fill-icon' : ''}`}>star</span>
                    </button>
                  ))}
                </div>

                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="说说您的照护体验吧..."
                  className="w-full h-24 bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-primary mb-6 resize-none"
                />

                <div className="flex w-full gap-3">
                   <button 
                    onClick={() => setShowReview(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl active:bg-slate-200"
                   >
                     取消
                   </button>
                   <button 
                    onClick={handleReview}
                    className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                   >
                     提交评价
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
