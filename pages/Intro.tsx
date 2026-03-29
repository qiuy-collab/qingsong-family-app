import React, { useState } from 'react';
import { BrandLogo } from './Login';

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: '智慧陪护，让爱更近',
      desc: '青松智陪，为家属提供专业、温暖又易用的科技助老服务。',
      icon: 'video_chat',
      color: 'bg-primary/5',
    },
    {
      title: '实时数据，随时掌握',
      desc: '健康数据、异常提醒和趋势变化一目了然，远程也能安心。',
      icon: 'monitor_heart',
      color: 'bg-rose-50',
    },
    {
      title: '精选机构，支持 VR 预览',
      desc: '在线筛选照护机构，先看服务与环境，再决定是否签约。',
      icon: 'vrpano',
      color: 'bg-emerald-50',
    },
  ];

  const current = steps[step - 1];

  const next = () => {
    if (step < 3) {
      setStep((currentStep) => currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background px-6">
      <header className="flex items-center justify-between pt-12">
        <div className="flex items-center gap-1.5 opacity-80">
          <BrandLogo className="h-8 w-8" />
          <span className="text-sm font-black tracking-tighter text-primary">青松智陪</span>
        </div>
        <button onClick={onComplete} className="rounded-full bg-white/50 px-3 py-1 text-sm font-medium text-slate-400 backdrop-blur-sm">
          跳过
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center">
        <div className="relative mb-12 aspect-square w-full max-w-[320px]">
          <div
            className={`absolute inset-0 rounded-full blur-[80px] opacity-20 ${
              step === 1 ? 'bg-primary' : step === 2 ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          />
          <div
            className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-[3rem] border border-white shadow-2xl ${current.color}`}
          >
            {step === 1 ? (
              <div className="animate-in zoom-in flex flex-col items-center duration-700">
                <BrandLogo className="mb-2 h-40 w-40" />
                <div className="-space-x-4 flex">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-blue-100 shadow-lg">
                    <span className="material-symbols-outlined text-sm text-blue-500">person</span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-orange-100 shadow-lg">
                    <span className="material-symbols-outlined text-sm text-orange-500">elderly</span>
                  </div>
                </div>
              </div>
            ) : (
              <span
                className={`material-symbols-outlined animate-in slide-in-from-bottom-8 text-[120px] opacity-80 duration-500 ${
                  step === 2 ? 'text-rose-500' : 'text-emerald-500'
                }`}
              >
                {current.icon}
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 space-y-4 text-center">
          <h1 className="px-2 text-3xl font-[900] leading-tight tracking-tight text-slate-900">{current.title}</h1>
          <p className="px-8 text-base font-medium leading-relaxed text-slate-500">{current.desc}</p>
        </div>

        <div className="flex w-full items-center justify-center gap-2.5 py-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`h-2 rounded-full transition-all duration-300 ${step === item ? 'w-8 bg-primary' : 'w-2 bg-slate-200'}`}
            />
          ))}
        </div>
      </main>

      <footer className="flex flex-col items-center gap-6 pb-12">
        <button
          onClick={next}
          className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-white shadow-xl shadow-primary/30 transition-all active:scale-[0.98]"
        >
          <span>{step === 3 ? '进入应用' : '继续探索'}</span>
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>
        <div className="flex items-center gap-2 opacity-30">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Qingsong Zhipai · Tech for Care</span>
        </div>
      </footer>
    </div>
  );
};

export default Intro;
