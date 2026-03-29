import React, { useEffect, useMemo, useState } from 'react';
import { appDataService } from '../services/appDataService';
import type { Order } from '../types';
import { View } from '../types';

interface OrdersProps {
  onNavigate: (view: View) => void;
  onShowToast: (msg: string) => void;
}

const Orders: React.FC<OrdersProps> = ({ onNavigate, onShowToast }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [showReviewFor, setShowReviewFor] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadOrders = async () => {
      try {
        const result = await appDataService.listOrders();
        if (!cancelled) {
          setOrders(result);
        }
      } catch (error) {
        if (!cancelled) {
          onShowToast('订单加载失败');
        }
      }
    };
    void loadOrders();
    return () => {
      cancelled = true;
    };
  }, [onShowToast]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => activeTab === 'all' || order.status === activeTab),
    [orders, activeTab],
  );

  const handleReview = async () => {
    if (!showReviewFor) return;
    if (rating === 0) {
      onShowToast('请先选择评分');
      return;
    }

    try {
      await appDataService.submitOrderReview(showReviewFor, rating, comment);
      setOrders((current) =>
        current.map((item) => (item.id === showReviewFor ? { ...item, status: 'completed' } : item)),
      );
      onShowToast('评价已提交，感谢您的反馈');
      setShowReviewFor(null);
      setRating(0);
      setComment('');
    } catch (error) {
      onShowToast('评价提交失败');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 pb-12">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4">
        <button onClick={() => onNavigate(View.PROFILE)} className="p-2 -ml-2 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
        </button>
        <h1 className="text-lg font-bold">我的签约服务</h1>
        <button onClick={() => onShowToast('帮助文档准备中')} className="p-2 -mr-2 text-slate-400">
          <span className="material-symbols-outlined text-xl">help_outline</span>
        </button>
      </header>

      <div className="flex gap-8 border-b border-slate-50 bg-white px-6 pb-4 pt-2">
        {(['全部', '履约中', '已完成'] as const).map((label, index) => {
          const tab = (['all', 'active', 'completed'] as const)[index];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-2 text-sm font-bold transition-colors ${activeTab === tab ? 'text-primary' : 'text-slate-400'}`}
            >
              {label}
              {activeTab === tab && <div className="animate-in slide-in-from-left absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary duration-300" />}
            </button>
          );
        })}
      </div>

      <main className="space-y-4 px-4 pt-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="animate-in fade-in slide-in-from-bottom-4 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm duration-300"
            >
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        order.type === 'pro' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined fill-icon text-2xl">
                        {order.type === 'pro' ? 'fitness_center' : 'home_work'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{order.service_name}</h3>
                      <p className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        {order.org_name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                      order.status === 'active'
                        ? 'bg-green-50 text-green-500'
                        : order.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-600'
                          : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {order.status === 'active' ? '履约中' : order.status === 'pending' ? '待处理' : '已完成'}
                  </span>
                </div>

                <div className="mb-5 flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <div className="text-[10px] text-slate-400">
                    订单号 <span className="ml-1 font-mono text-slate-600">{order.order_no}</span>
                  </div>
                  <div className="text-base font-black text-primary">{order.price.toLocaleString()} 元</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onShowToast('正在为您连线机构客服…')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-xs font-bold text-slate-600 transition-colors active:bg-slate-100"
                  >
                    <span className="material-symbols-outlined text-sm">support_agent</span>
                    联系客服
                  </button>
                  <button
                    onClick={() => setShowReviewFor(order.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">rate_review</span>
                    评价服务
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-4 py-20 text-slate-300">
            <span className="material-symbols-outlined text-6xl opacity-20">receipt_long</span>
            <p className="text-sm font-bold">暂无相关订单记录</p>
          </div>
        )}
      </main>

      {showReviewFor && (
        <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 px-6 backdrop-blur-sm duration-300">
          <div className="animate-in zoom-in-95 w-full max-w-xs rounded-[2.5rem] bg-white p-8 shadow-2xl duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
                <span className="material-symbols-outlined fill-icon text-3xl">star</span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-800">评价您的服务</h3>
              <p className="mb-6 text-xs text-slate-400">您的意见会帮助我们持续优化照护体验</p>

              <div className="mb-6 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`transition-all ${rating >= star ? 'scale-110 text-yellow-400' : 'text-slate-200 hover:text-yellow-100'}`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${rating >= star ? 'fill-icon' : ''}`}>star</span>
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="说说您的照护体验吧…"
                className="mb-6 h-24 w-full resize-none rounded-2xl border-none bg-slate-50 p-4 text-sm focus:ring-primary"
              />

              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowReviewFor(null)}
                  className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-500 active:bg-slate-200"
                >
                  取消
                </button>
                <button
                  onClick={() => void handleReview()}
                  className="flex-[2] rounded-2xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
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
