
import React from 'react';
import { View } from '../types';
import { ORGANIZATIONS } from '../constants';
import BottomNav from '../components/BottomNav';

// Added onShowToast and updated onNavigate to accept optional params to match App.tsx
interface OrgDetailsProps {
  orgId: string | null;
  onBack: () => void;
  onSign: () => void;
  onNavigate: (view: View, params?: any) => void;
  onShowToast: (message: string) => void;
}

const OrgDetails: React.FC<OrgDetailsProps> = ({ orgId, onBack, onSign, onNavigate, onShowToast }) => {
  const org = ORGANIZATIONS.find(o => o.id === orgId) || ORGANIZATIONS[0];

  return (
    <div className="flex flex-col min-h-screen pb-40">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-4 h-11 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2">
          <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
        </button>
        <h1 className="text-lg font-semibold">机构详情</h1>
        <button className="p-2 -mr-2">
          <span className="material-symbols-outlined text-xl">share</span>
        </button>
      </header>

      <main className="px-4 space-y-6">
        <section className="mt-2 relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-200">
          <img src={org.image} alt={org.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-6 py-3 flex flex-col items-center" onClick={() => onShowToast('VR全景功能载入中...')}>
              <span className="material-symbols-outlined text-white text-3xl">360</span>
              <span className="text-white text-sm font-medium">进入VR全景</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[12px] fill-icon">verified</span>已认证
            </span>
            <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">支持VR</span>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-1">{org.name}</h2>
          <div className="flex items-center text-slate-500 text-sm mb-4">
            <span className="material-symbols-outlined text-sm mr-1">location_on</span>
            北京市, 朝阳区 · {org.distance}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="text-xs text-slate-400 mb-1">起始价格</div>
              <div className="text-primary font-bold text-lg">¥{org.price}<span className="text-sm font-normal text-slate-400">/月</span></div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="text-xs text-slate-400 mb-1">照护类型</div>
              <div className="font-bold text-slate-800">协助照护与康复</div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">服务与照护</h3>
            <button className="text-primary text-sm font-medium" onClick={() => onShowToast('正在展示完整服务列表')}>查看全部</button>
          </div>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl flex gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">monitor_heart</span>
              </div>
              <div>
                <h4 className="font-bold mb-1">康复中心</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  为术后提供专业康复中心，促进术后适应，针对性康复训练。
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full font-medium">理疗</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full font-medium">言语治疗</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl flex gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-orange-500">restaurant</span>
              </div>
              <div>
                <h4 className="font-bold mb-1">营养膳食</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  定制低糖低盐，全面营养食谱搭配。确保膳食健康。
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full font-medium">低糖糖尿病</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full font-medium">送餐服务</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">用户评价 <span className="text-sm font-normal text-slate-400 ml-1">128 条</span></h3>
            <button className="text-primary text-sm font-medium" onClick={() => onShowToast('正在加载更多评价')}>查看全部</button>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <img src="https://picsum.photos/seed/user/100/100" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-sm">张先生</div>
                  <div className="text-[10px] text-slate-400">亲属 · 入住2年</div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400">2天前</div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              我父亲很喜欢这里的花园。工作人员非常有耐心，帮助他重新走路。
            </p>
          </div>
        </section>
      </main>

      <div className="fixed bottom-[83px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-3 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex gap-3 z-40">
        <button className="flex-1 py-3 border border-primary text-primary rounded-full font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform" onClick={() => onShowToast('正在呼叫机构专线...')}>
          <span className="material-symbols-outlined text-lg">phone_in_talk</span>
          一键咨询
        </button>
        <button 
          onClick={onSign}
          className="flex-1 py-3 bg-primary text-white rounded-full font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/20"
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
