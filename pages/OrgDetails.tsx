import React, { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { appDataService } from '../services/appDataService';
import type { InstitutionDetail } from '../types';
import { View } from '../types';

interface OrgDetailsProps {
  orgId: string | null;
  onBack: () => void;
  onSign: () => void;
  onNavigate: (view: View, params?: Record<string, unknown>) => void;
  onShowToast: (message: string) => void;
}

const OrgDetails: React.FC<OrgDetailsProps> = ({ orgId, onBack, onSign, onNavigate, onShowToast }) => {
  const [detail, setDetail] = useState<InstitutionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const targetId = orgId ?? 'inst-1';
    const load = async () => {
      try {
        const result = await appDataService.getInstitutionDetail(targetId);
        if (!cancelled) {
          setDetail(result);
        }
      } catch (error) {
        if (!cancelled) {
          onShowToast('机构详情加载失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgId, onShowToast]);

  if (loading || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">
        正在加载机构详情…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pb-40">
      <header className="sticky top-0 z-50 flex h-11 items-center justify-between bg-background/80 px-4 backdrop-blur-md">
        <button onClick={onBack} className="p-2 -ml-2">
          <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
        </button>
        <h1 className="text-lg font-semibold">机构详情</h1>
        <button className="p-2 -mr-2" onClick={() => onShowToast('分享功能准备中')}>
          <span className="material-symbols-outlined text-xl">share</span>
        </button>
      </header>

      <main className="space-y-6 px-4">
        <section className="relative mt-2 aspect-[4/3] overflow-hidden rounded-3xl bg-slate-200">
          <img src={detail.image} alt={detail.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="flex flex-col items-center rounded-full border border-white/30 bg-white/20 px-6 py-3 backdrop-blur-md"
              onClick={() => onShowToast('VR 全景预览准备中')}
            >
              <span className="material-symbols-outlined text-3xl text-white">360</span>
              <span className="text-sm font-medium text-white">进入 VR 全景</span>
            </button>
          </div>
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
              <span className="material-symbols-outlined fill-icon text-[12px]">verified</span>
              已认证
            </span>
            <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">支持 VR</span>
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-2xl font-bold">{detail.name}</h2>
          <div className="mb-4 flex items-center text-sm text-slate-500">
            <span className="material-symbols-outlined mr-1 text-sm">location_on</span>
            {detail.city} {detail.district} · {detail.distance}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-1 text-xs text-slate-400">起始价格</div>
              <div className="text-lg font-bold text-primary">
                {detail.price.toLocaleString()}
                <span className="text-sm font-normal text-slate-400"> 元/月起</span>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-1 text-xs text-slate-400">照护类型</div>
              <div className="font-bold text-slate-800">{detail.care_type}</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{detail.description}</p>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">服务与照护</h3>
            <button className="text-sm font-medium text-primary" onClick={() => onShowToast('已展示主要服务项')}>
              查看全部
            </button>
          </div>
          <div className="space-y-3">
            {detail.services.map((service) => (
              <div key={service.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <span className="material-symbols-outlined text-primary">{service.icon}</span>
                </div>
                <div>
                  <h4 className="mb-1 font-bold">{service.title}</h4>
                  <p className="text-xs leading-relaxed text-slate-500">{service.description}</p>
                  <div className="mt-2 flex gap-2">
                    {service.highlights.map((item) => (
                      <span key={item} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">
              用户评价 <span className="ml-1 text-sm font-normal text-slate-400">{detail.reviews_count} 条</span>
            </h3>
            <button className="text-sm font-medium text-primary" onClick={() => onShowToast('已展示精选评价')}>
              查看全部
            </button>
          </div>
          <div className="space-y-3">
            {detail.reviews.map((review) => (
              <div key={review.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex gap-3">
                    <img src="https://picsum.photos/seed/user/100/100" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-sm">{review.author_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {review.relation_label} · {review.stay_duration_label}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400">{review.created_at_label}</div>
                </div>
                <p className="text-sm leading-relaxed text-slate-700">{review.content}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-[83px] left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 gap-3 border-t border-slate-100 bg-white/80 px-4 py-3 backdrop-blur-xl">
        <button
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-primary py-3 font-bold text-primary transition-transform active:scale-95"
          onClick={() => onShowToast('正在呼叫机构专线…')}
        >
          <span className="material-symbols-outlined text-lg">phone_in_talk</span>
          一键咨询
        </button>
        <button
          onClick={onSign}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">edit_calendar</span>
          在线签约
        </button>
      </div>

      <BottomNav activeView={View.HOME} onNavigate={onNavigate} />
    </div>
  );
};

export default OrgDetails;
