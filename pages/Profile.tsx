import React, { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { storage } from '../lib/storage';
import type { AuthProfile } from '../types';
import { View } from '../types';

interface ProfileProps {
  onNavigate: (view: View) => void;
  onShowToast: (msg: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate, onShowToast }) => {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'invite' | 'logout' | 'scan'>('none');
  const [scanningStep, setScanningStep] = useState<'idle' | 'scanning' | 'success'>('idle');

  useEffect(() => {
    setProfile(storage.getProfile<AuthProfile>());
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    if (activeModal === 'scan' && scanningStep === 'scanning') {
      timer = window.setTimeout(() => {
        setScanningStep('success');
        onShowToast('识别成功');
      }, 2200);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [activeModal, scanningStep, onShowToast]);

  const startScan = () => {
    setActiveModal('scan');
    setScanningStep('scanning');
  };

  const handleLogout = () => {
    storage.clearAuth();
    storage.clearAssistantSessionId();
    onShowToast('账号已退出');
    onNavigate(View.LOGIN);
  };

  return (
    <div className="relative flex min-h-screen flex-col pb-24">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-100 bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate(View.HOME)} className="p-1 transition-transform active:scale-90">
            <span className="material-symbols-outlined text-primary">chevron_left</span>
          </button>
          <button
            onClick={startScan}
            className="flex items-center justify-center rounded-full bg-slate-50 p-1 transition-transform active:scale-90"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-600">center_focus_weak</span>
          </button>
        </div>
        <h1 className="text-lg font-bold">家庭设置</h1>
        <button onClick={() => setActiveModal('invite')} className="text-sm font-bold text-primary transition-opacity active:opacity-50">
          邀请
        </button>
      </header>

      <main className="space-y-4 px-4 pt-4">
        <section className="flex items-center gap-4 rounded-3xl border border-slate-50 bg-white p-5 shadow-sm">
          <div className="relative">
            <img src={profile?.avatar_url ?? 'https://picsum.photos/seed/family-user/200/200'} className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm" alt="Profile" />
            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">{profile?.full_name ?? '张女士'}</h2>
              <span className="text-sm text-slate-500">家属账号</span>
            </div>
            <div className="mt-1 flex w-fit items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-primary">
              <span className="material-symbols-outlined fill-icon text-[12px]">security</span>
              AI 守护监测中
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-2 px-1 text-base font-bold text-slate-800">服务与订单</h3>
          <button
            onClick={() => onNavigate(View.ORDERS)}
            className="flex w-full items-center justify-between rounded-3xl border border-slate-50 bg-white p-4 shadow-sm transition-colors active:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                <span className="material-symbols-outlined fill-icon">description</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-700">我的签约订单</p>
                <p className="text-[11px] text-slate-400">查看履约进度、服务评价和历史记录</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </button>
        </section>

        <section>
          <div className="mb-2 px-1">
            <h3 className="text-base font-bold text-slate-800">照护小组成员</h3>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Group Management</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-3xl border border-slate-50 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <img src="https://picsum.photos/seed/admin/100/100" className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-slate-800">您（管理员）</div>
                  <p className="text-[11px] text-slate-400">主要紧急联系人</p>
                </div>
              </div>
              <span className="material-symbols-outlined fill-icon text-primary">verified_user</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={startScan}
                className="group flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 py-6 text-primary transition-colors active:bg-primary/10"
              >
                <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="material-symbols-outlined text-2xl transition-transform group-active:scale-110">qr_code_scanner</span>
                </div>
                <span className="text-xs font-bold">扫码加入小组</span>
              </button>
              <button
                onClick={() => setActiveModal('invite')}
                className="group flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 py-6 text-slate-400 transition-colors hover:bg-white active:bg-slate-100"
              >
                <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                  <span className="material-symbols-outlined text-2xl transition-transform group-active:scale-110">person_add</span>
                </div>
                <span className="text-xs font-bold">邀请新成员</span>
              </button>
            </div>
          </div>
        </section>

        <div className="pb-12 pt-8 text-center">
          <button onClick={() => setActiveModal('logout')} className="mx-auto flex items-center justify-center gap-2 text-sm font-bold text-red-500 transition-opacity active:opacity-50">
            <span className="material-symbols-outlined text-lg">logout</span>
            退出登录
          </button>
        </div>
      </main>

      {activeModal === 'scan' && (
        <div className="animate-in fade-in fixed inset-0 z-[100] flex flex-col bg-black duration-500">
          <div className="relative flex flex-1 flex-col items-center justify-center">
            <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-slate-900">
              <div className={`h-full w-full bg-[radial-gradient(circle_at_center,_transparent_40%,_black_100%)] transition-opacity duration-700 ${scanningStep === 'success' ? 'opacity-30' : 'opacity-100'}`} />
              <div
                className={`absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 transition-all duration-500 ${
                  scanningStep === 'success' ? 'scale-90 border-green-500' : 'border-primary/50'
                }`}
              >
                {[
                  'top-0 left-0 border-t-4 border-l-4 rounded-tl-xl',
                  'top-0 right-0 border-t-4 border-r-4 rounded-tr-xl',
                  'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl',
                  'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl',
                ].map((position) => (
                  <div
                    key={position}
                    className={`absolute h-8 w-8 ${position} ${scanningStep === 'success' ? 'border-green-500' : 'border-primary'}`}
                  />
                ))}
                {scanningStep === 'scanning' && (
                  <div className="absolute left-0 top-0 h-1 w-full animate-[scan_2s_infinite] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
                )}
                {scanningStep === 'success' && (
                  <div className="animate-in zoom-in absolute inset-0 flex items-center justify-center duration-300">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/40">
                      <span className="material-symbols-outlined text-5xl font-bold text-white">done_all</span>
                    </div>
                  </div>
                )}
              </div>

              <style>{`
                @keyframes scan {
                  0% { top: 0%; opacity: 0; }
                  20% { opacity: 1; }
                  80% { opacity: 1; }
                  100% { top: 100%; opacity: 0; }
                }
              `}</style>
            </div>

            <div className="absolute top-12 flex w-full items-center justify-between px-6 text-white">
              <button
                onClick={() => {
                  setActiveModal('none');
                  setScanningStep('idle');
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-transform active:scale-90"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <span className="text-sm font-bold uppercase tracking-widest">
                {scanningStep === 'scanning' ? 'Scanning…' : 'Identified'}
              </span>
              <button onClick={() => onShowToast('闪光灯已开启')} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-transform active:scale-90">
                <span className="material-symbols-outlined">flashlight_on</span>
              </button>
            </div>

            {scanningStep === 'success' ? (
              <div className="animate-in slide-in-from-bottom absolute bottom-12 w-full px-6 duration-500">
                <div className="rounded-[2rem] bg-white p-6 shadow-2xl">
                  <div className="mb-6 flex items-center gap-4">
                    <img src="https://picsum.photos/seed/inviter/100/100" className="h-14 w-14 rounded-full border-2 border-slate-50 object-cover" alt="Inviter" />
                    <div>
                      <h3 className="text-base font-bold text-slate-800">刘老师（长子）</h3>
                      <p className="text-xs text-slate-400">邀请您加入“张爷爷”的照护小组</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setActiveModal('none');
                        setScanningStep('idle');
                      }}
                      className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-500 active:bg-slate-200"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        onShowToast('已加入照护小组');
                        setActiveModal('none');
                        setScanningStep('idle');
                      }}
                      className="flex-[2] rounded-2xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
                    >
                      确认加入小组
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="absolute bottom-32 px-12 text-center text-xs font-bold leading-relaxed text-white/60">
                将邀请二维码放入框内即可自动识别
              </p>
            )}
          </div>

          <div className="flex h-24 items-center justify-center gap-12 bg-black px-12 pb-6">
            <button className="flex flex-col items-center gap-1 text-white/40" onClick={() => onShowToast('正在打开相册')}>
              <span className="material-symbols-outlined">photo_library</span>
              <span className="text-[10px] font-bold">从相册选择</span>
            </button>
            <button className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-primary">
              <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
            </button>
          </div>
        </div>
      )}

      {activeModal === 'invite' && (
        <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 px-6 backdrop-blur-sm duration-300">
          <div className="animate-in zoom-in-95 w-full max-w-xs rounded-[2.5rem] bg-white p-8 shadow-2xl duration-200">
            <h3 className="mb-6 text-center text-xl font-bold text-slate-800">我的邀请码</h3>
            <div className="relative mb-6 aspect-square overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50">
              <div className="flex h-full items-center justify-center">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=qingsong-family-invite-id8892" className="h-40 w-40" alt="QR Code" />
              </div>
            </div>
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-slate-100 p-4">
              <span className="font-mono font-bold tracking-wider text-slate-500">QS-ZP-8892</span>
              <button onClick={() => onShowToast('邀请码已复制')} className="text-xs font-bold text-primary">
                复制
              </button>
            </div>
            <button onClick={() => setActiveModal('none')} className="w-full rounded-2xl bg-primary py-4 font-bold text-white transition-transform active:scale-95">
              关闭
            </button>
          </div>
        </div>
      )}

      {activeModal === 'logout' && (
        <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 px-6 backdrop-blur-sm duration-300">
          <div className="w-full max-w-xs rounded-[2rem] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800">确认退出登录？</h3>
            <p className="mt-2 text-sm text-slate-500">退出后需要重新登录，当前本地会话会被清除。</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setActiveModal('none')} className="flex-1 rounded-2xl bg-slate-100 py-3 font-bold text-slate-500">
                取消
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-2xl bg-red-500 py-3 font-bold text-white transition-transform active:scale-95"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeView={View.PROFILE} onNavigate={onNavigate} />
    </div>
  );
};

export default Profile;
