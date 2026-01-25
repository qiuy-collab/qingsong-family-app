
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
      desc: '青松智陪，为您提供专业温情的科技养老服务。',
      icon: 'video_chat',
      color: 'bg-primary/5'
    },
    {
      title: '实时数据，随时掌控',
      desc: '专业医疗级监测，科技守护长辈健康。',
      icon: 'monitor_heart',
      color: 'bg-rose-50'
    },
    {
      title: '精选机构，VR实景',
      desc: 'VR实景云端看房，足不出户实地考察。',
      icon: 'vrpano',
      color: 'bg-emerald-50'
    }
  ];

  const current = steps[step - 1];

  const next = () => {
    if (step < 3) setStep(step + 1);
    else onComplete();
  };

  return (
    <div className="flex flex-col h-screen px-6 bg-background">
      <header className="flex justify-between items-center pt-12">
        <div className="flex items-center gap-1.5 opacity-80">
          <BrandLogo className="w-8 h-8" />
          <span className="text-primary font-black text-sm tracking-tighter">青松智陪</span>
        </div>
        <button onClick={onComplete} className="text-slate-400 text-sm font-medium px-3 py-1 bg-white/50 rounded-full backdrop-blur-sm">跳过</button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full aspect-square relative mb-12 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full blur-[80px] opacity-20 ${step === 1 ? 'bg-primary' : step === 2 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
          <div className={`relative w-full h-full max-h-[320px] rounded-[3rem] overflow-hidden ${current.color} flex flex-col items-center justify-center border border-white shadow-2xl`}>
             {step === 1 ? (
               <div className="flex flex-col items-center animate-in zoom-in duration-700">
                 <BrandLogo className="w-40 h-40 mb-2 animate-rotate-slow" />
                 <div className="flex -space-x-4">
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-blue-500 text-sm">person</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-orange-500 text-sm">elderly</span>
                    </div>
                 </div>
               </div>
             ) : (
               <span className={`material-symbols-outlined text-[120px] ${step === 2 ? 'text-rose-500' : 'text-emerald-500'} opacity-80 animate-in slide-in-from-bottom-8 duration-500`}>
                  {current.icon}
               </span>
             )}
          </div>
        </div>

        <div className="space-y-4 text-center mb-6">
          <h1 className="text-slate-900 tracking-tight text-3xl font-[900] leading-tight px-2">
            {current.title}
          </h1>
          <p className="text-slate-500 text-base font-medium leading-relaxed px-8">
            {current.desc}
          </p>
        </div>

        <div className="flex w-full flex-row items-center justify-center gap-2.5 py-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-primary' : 'w-2 bg-slate-200'}`}></div>
          ))}
        </div>
      </main>

      <footer className="pb-12 flex flex-col items-center gap-6">
        <button 
          onClick={next}
          className="w-full h-16 bg-primary text-white text-lg font-bold rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
