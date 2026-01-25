
import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

/**
 * BrandLogo - 1:1 像素级还原
 * 实心蓝色圆底 + 白色负空间螺旋纹理
 */
export const BrandLogo: React.FC<{ className?: string }> = ({ className = "w-32 h-32" }) => (
  <div className={`relative ${className} flex items-center justify-center`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      {/* 蓝色实心圆底 */}
      <circle cx="50" cy="50" r="48" fill="#165EB3" />
      
      {/* 负空间螺旋纹理 (白色) */}
      <g transform="rotate(-10 50 50)">
        {/* 外层大弧线 */}
        <path d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C60 15 68 18 75 25" stroke="#FDF8F1" strokeWidth="8" strokeLinecap="round" />
        {/* 中层弧线 */}
        <path d="M72 50C72 62.15 62.15 72 50 72C37.85 72 28 62.15 28 50C28 37.85 37.85 28 50 28C58 28 65 32 68 38" stroke="#FDF8F1" strokeWidth="6" strokeLinecap="round" />
        {/* 内层核心弧线 */}
        <path d="M60 50C60 55.52 55.52 60 50 60C44.48 60 40 55.52 40 50C40 44.48 44.48 40 50 40" stroke="#FDF8F1" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isAgreed, setIsAgreed] = useState(false);
  const [phone, setPhone] = useState('');

  const handleAction = () => {
    if (!isAgreed) {
      alert('请先阅读并同意用户协议及隐私政策');
      return;
    }
    onLogin();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <header className="flex items-center justify-between p-4 pt-10 sticky top-0 bg-background z-10">
        <button className="p-2 text-slate-400">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="text-primary font-bold text-sm">联系客服</div>
      </header>

      <div className="flex-1 flex flex-col px-10 pt-4 pb-12 w-full max-w-[430px] mx-auto">
        {/* 品牌视觉核心展示 */}
        <div className="flex flex-col items-center mb-12">
          <BrandLogo className="w-36 h-36 mb-6" />
          
          {/* 标题：Noto Sans SC 900 档位，极厚重，字间距略收 */}
          <h1 className="text-primary text-[44px] font-[900] tracking-[-0.04em] leading-none mb-4">
            青松智陪
          </h1>
          
          {/* 副标题：极细字重，极宽间距，中圆点分隔 */}
          <div className="flex items-center justify-center w-full">
            <p className="text-primary/80 text-[13px] font-medium tracking-[0.5em] whitespace-nowrap pl-[0.5em]">
              专业 · 温暖 · 科技助老
            </p>
          </div>
        </div>

        {/* 交互 Tab */}
        <div className="flex gap-10 mb-10 border-b border-primary/5">
          <button 
            onClick={() => setMode('login')}
            className={`pb-4 text-xl font-bold transition-all relative ${mode === 'login' ? 'text-primary' : 'text-slate-300'}`}
          >
            登录
            {mode === 'login' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary rounded-full"></div>}
          </button>
          <button 
            onClick={() => setMode('register')}
            className={`pb-4 text-xl font-bold transition-all relative ${mode === 'register' ? 'text-primary' : 'text-slate-300'}`}
          >
            注册
            {mode === 'register' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary rounded-full"></div>}
          </button>
        </div>

        {/* 输入表单 */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300">smartphone</span>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号" 
                className="w-full h-16 rounded-[22px] border-none bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] pl-14 pr-6 text-base font-medium focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
              />
            </div>
            
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300">verified_user</span>
              <input 
                type="number" 
                placeholder="验证码" 
                className="w-full h-16 rounded-[22px] border-none bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] pl-14 pr-32 text-base font-medium focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
              />
              <button className="absolute right-3 top-3 bottom-3 px-5 text-primary font-bold rounded-xl text-sm hover:bg-primary/5 transition-colors">
                获取验证码
              </button>
            </div>
          </div>

          <button 
            onClick={handleAction}
            className="w-full h-16 bg-primary text-white font-bold text-lg rounded-[22px] shadow-[0_15px_35px_rgba(22,94,179,0.25)] active:scale-[0.97] transition-all mt-6 flex items-center justify-center gap-2"
          >
            {mode === 'login' ? '确认登录' : '立即注册'}
          </button>

          <div className="flex justify-between px-2">
            <button className="text-[13px] text-slate-400 font-medium">遇到问题？</button>
            <button className="text-[13px] text-primary font-bold">账号密码登录</button>
          </div>
        </div>

        {/* 底部协议与第三方 */}
        <div className="mt-12 pb-10">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-slate-200"></div>
              <span className="text-[10px] text-slate-300 font-bold tracking-[0.2em] uppercase">其他方式</span>
              <div className="h-[1px] w-12 bg-slate-200"></div>
            </div>
            <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#1AAD19] shadow-[0_5px_15px_rgba(0,0,0,0.05)] active:scale-90 transition-transform">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M8.281 12.188c0-.391.313-.703.703-.703h5.273c.391 0 .703.313.703.703s-.313.703-.703.703H8.984a.711.711 0 0 1-.703-.703zm0-2.813c0-.391.313-.703.703-.703h5.273c.391 0 .703.313.703.703s-.313.703-.703.703H8.984a.711.711 0 0 1-.703-.703zm7.031-4.219c-4.453 0-8.086 3.125-8.086 6.992 0 2.148 1.133 4.062 2.891 5.391l-.742 2.227 2.539-1.25a8.7 8.7 0 0 0 3.398.703c4.453 0 8.086-3.125 8.086-6.992s-3.633-7.072-8.086-7.072zM1.953 8.32c0 3.398 2.813 6.133 6.641 6.133.586 0 1.172-.039 1.719-.156l1.953.977-.547-1.758c1.328-1.055 2.148-2.5 2.148-4.102 0-3.398-2.813-6.172-6.641-6.172-3.828.039-7.273 2.813-7.273 6.178z"></path>
              </svg>
            </button>
          </div>

          <div className="flex items-start gap-3 px-2">
            <button 
              onClick={() => setIsAgreed(!isAgreed)}
              className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${isAgreed ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
            >
              {isAgreed && <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>}
            </button>
            <label className="text-[12px] text-slate-400 leading-relaxed cursor-pointer" onClick={() => setIsAgreed(!isAgreed)}>
              我已阅读并同意 <span className="text-primary font-bold">《用户协议》</span> 和 <span className="text-primary font-bold">《隐私政策》</span>，授权青松智陪使用您的手机号提供服务。
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
