import React, { useState } from 'react';
import { demoLogin } from '../services/authService';

interface LoginProps {
  onLogin: () => void;
}

export const BrandLogo: React.FC<{ className?: string }> = ({ className = 'w-32 h-32' }) => (
  <div className={`relative ${className} flex items-center justify-center`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full drop-shadow-sm">
      <circle cx="50" cy="50" r="48" fill="#165EB3" />
      <g transform="rotate(-10 50 50)">
        <path
          d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C60 15 68 18 75 25"
          stroke="#FDF8F1"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M72 50C72 62.15 62.15 72 50 72C37.85 72 28 62.15 28 50C28 37.85 37.85 28 50 28C58 28 65 32 68 38"
          stroke="#FDF8F1"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M60 50C60 55.52 55.52 60 50 60C44.48 60 40 55.52 40 50C40 44.48 44.48 40 50 40"
          stroke="#FDF8F1"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  </div>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isAgreed, setIsAgreed] = useState(false);
  const [phone, setPhone] = useState('13800138000');
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!isAgreed) {
      window.alert('请先阅读并同意用户协议与隐私政策');
      return;
    }

    try {
      setLoading(true);
      await demoLogin(phone);
      onLogin();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background p-4 pt-10">
        <button className="p-2 text-slate-400">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="text-sm font-bold text-primary">联系客服</div>
      </header>

      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col px-10 pb-12 pt-4">
        <div className="mb-12 flex flex-col items-center">
          <BrandLogo className="mb-6 h-36 w-36" />
          <h1 className="mb-4 text-[44px] font-[900] leading-none tracking-[-0.04em] text-primary">青松智陪</h1>
          <div className="flex w-full items-center justify-center">
            <p className="whitespace-nowrap pl-[0.5em] text-[13px] font-medium tracking-[0.5em] text-primary/80">
              专业 路 温暖 路 科技助老
            </p>
          </div>
        </div>

        <div className="mb-10 flex gap-10 border-b border-primary/5">
          <button
            onClick={() => setMode('login')}
            className={`relative pb-4 text-xl font-bold transition-all ${mode === 'login' ? 'text-primary' : 'text-slate-300'}`}
          >
            登录
            {mode === 'login' && <div className="absolute bottom-0 left-0 right-0 h-1.5 rounded-full bg-primary" />}
          </button>
          <button
            onClick={() => setMode('register')}
            className={`relative pb-4 text-xl font-bold transition-all ${mode === 'register' ? 'text-primary' : 'text-slate-300'}`}
          >
            注册
            {mode === 'register' && <div className="absolute bottom-0 left-0 right-0 h-1.5 rounded-full bg-primary" />}
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">smartphone</span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="请输入手机号"
                className="h-16 w-full rounded-[22px] border-none bg-white pl-14 pr-6 text-base font-medium shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all placeholder:text-slate-300 focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">verified_user</span>
              <input
                type="number"
                placeholder="验证码"
                defaultValue="123456"
                className="h-16 w-full rounded-[22px] border-none bg-white pl-14 pr-32 text-base font-medium shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all placeholder:text-slate-300 focus:ring-2 focus:ring-primary/10"
              />
              <button className="absolute bottom-3 right-3 top-3 rounded-xl px-5 text-sm font-bold text-primary transition-colors hover:bg-primary/5">
                获取验证码
              </button>
            </div>
          </div>

          <button
            onClick={() => void handleAction()}
            disabled={loading}
            className="mt-6 flex h-16 w-full items-center justify-center gap-2 rounded-[22px] bg-primary text-lg font-bold text-white shadow-[0_15px_35px_rgba(22,94,179,0.25)] transition-all active:scale-[0.97] disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? '登录中…' : mode === 'login' ? '确认登录' : '立即注册'}
          </button>

          <div className="flex justify-between px-2">
            <button className="text-[13px] font-medium text-slate-400">遇到问题？</button>
            <button className="text-[13px] font-bold text-primary">账号密码登录</button>
          </div>
        </div>

        <div className="mt-12 pb-10">
          <div className="mb-8 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">其他方式</span>
              <div className="h-px w-12 bg-slate-200" />
            </div>
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#1AAD19] shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition-transform active:scale-90">
              <svg className="h-8 w-8 fill-current" viewBox="0 0 24 24">
                <path d="M8.281 12.188c0-.391.313-.703.703-.703h5.273c.391 0 .703.313.703.703s-.313.703-.703.703H8.984a.711.711 0 0 1-.703-.703zm0-2.813c0-.391.313-.703.703-.703h5.273c.391 0 .703.313.703.703s-.313.703-.703.703H8.984a.711.711 0 0 1-.703-.703zm7.031-4.219c-4.453 0-8.086 3.125-8.086 6.992 0 2.148 1.133 4.062 2.891 5.391l-.742 2.227 2.539-1.25a8.7 8.7 0 0 0 3.398.703c4.453 0 8.086-3.125 8.086-6.992s-3.633-7.072-8.086-7.072zM1.953 8.32c0 3.398 2.813 6.133 6.641 6.133.586 0 1.172-.039 1.719-.156l1.953.977-.547-1.758c1.328-1.055 2.148-2.5 2.148-4.102 0-3.398-2.813-6.172-6.641-6.172-3.828.039-7.273 2.813-7.273 6.178z" />
              </svg>
            </button>
          </div>

          <div className="flex items-start gap-3 px-2">
            <button
              onClick={() => setIsAgreed((current) => !current)}
              className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                isAgreed ? 'border-primary bg-primary' : 'border-slate-200 bg-white'
              }`}
            >
              {isAgreed && <span className="material-symbols-outlined text-[16px] font-bold text-white">check</span>}
            </button>
            <label className="cursor-pointer text-[12px] leading-relaxed text-slate-400" onClick={() => setIsAgreed((current) => !current)}>
              我已阅读并同意 <span className="font-bold text-primary">《用户协议》</span> 和{' '}
              <span className="font-bold text-primary">《隐私政策》</span>，授权青松智陪使用您的手机号提供服务。
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
