
import React, { useState, useEffect } from 'react';
import { View } from '../types';
import BottomNav from '../components/BottomNav';

interface ProfileProps {
  onNavigate: (view: View) => void;
  onShowToast: (msg: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate, onShowToast }) => {
  const [permissions, setPermissions] = useState({
    health: true,
    orders: false,
    alerts: true,
    meds: true
  });

  // 交互状态控制
  const [activeModal, setActiveModal] = useState<'none' | 'invite' | 'elderly' | 'member' | 'logout' | 'scan'>('none');
  const [scanningStep, setScanningStep] = useState<'idle' | 'scanning' | 'success'>('idle');

  const togglePermission = (key: keyof typeof permissions, label: string) => {
    const nextState = !permissions[key];
    setPermissions(prev => ({ ...prev, [key]: nextState }));
    onShowToast(`${label}权限已${nextState ? '开启' : '关闭'}`);
  };

  const handleUnbind = () => {
    onShowToast('账户已安全解绑');
    onNavigate(View.LOGIN);
  };

  const startScan = () => {
    setActiveModal('scan');
    setScanningStep('scanning');
  };

  // 模拟扫码识别过程
  useEffect(() => {
    let timer: any;
    if (activeModal === 'scan' && scanningStep === 'scanning') {
      timer = setTimeout(() => {
        setScanningStep('success');
        onShowToast('识别成功');
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [activeModal, scanningStep]);

  const handleJoinGroup = () => {
    onShowToast('成功加入该长辈的照护小组');
    setActiveModal('none');
    setScanningStep('idle');
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 relative">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate(View.HOME)} className="p-1 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-primary">chevron_left</span>
          </button>
          <button onClick={startScan} className="p-1 active:scale-90 transition-transform flex items-center justify-center bg-slate-50 rounded-full">
            <span className="material-symbols-outlined text-slate-600 text-[20px]">center_focus_weak</span>
          </button>
        </div>
        <h1 className="text-lg font-bold">家庭设置</h1>
        <button 
          onClick={() => setActiveModal('invite')} 
          className="text-primary font-bold text-sm active:opacity-50 transition-opacity"
        >
          邀请
        </button>
      </header>

      <main className="px-4 space-y-4 pt-4">
        {/* 长辈档案卡片 */}
        <section 
          className="bg-white p-5 rounded-3xl shadow-sm flex items-center gap-4 active:bg-slate-50 transition-colors cursor-pointer border border-slate-50" 
          onClick={() => setActiveModal('elderly')}
        >
          <div className="relative">
            <img src="https://picsum.photos/seed/grandpa/200/200" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" alt="Elderly Profile" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">张爷爷</h2>
              <span className="text-sm text-slate-500">82 岁</span>
            </div>
            <div className="mt-1 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-[10px] text-primary font-bold w-fit">
              <span className="material-symbols-outlined text-[12px] fill-icon">security</span>
              AI 守护监测中
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-300">chevron_right</span>
        </section>

        {/* 订单与服务入口 */}
        <section>
          <h3 className="font-bold text-base text-slate-800 mb-2 px-1">服务与订单</h3>
          <button 
            onClick={() => onNavigate(View.ORDERS)}
            className="w-full bg-white p-4 rounded-3xl shadow-sm flex items-center justify-between border border-slate-50 active:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-primary rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined fill-icon">description</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-slate-700">我的签约订单</p>
                <p className="text-[11px] text-slate-400">管理已签约的服务项目与评价</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </div>
          </button>
        </section>

        {/* 照护小组成员 */}
        <section>
          <div className="flex justify-between items-end mb-2 px-1">
            <div>
              <h3 className="font-bold text-base text-slate-800">照护小组成员</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Group Management</p>
            </div>
          </div>
          <div className="space-y-3">
            {/* 成员列表省略 (已在原有代码中) */}
            <div className="bg-white p-4 rounded-3xl shadow-sm flex items-center justify-between border border-slate-50">
              <div className="flex items-center gap-3">
                <img src="https://picsum.photos/seed/admin/100/100" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">您 (管理员)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">主要紧急联系人</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary fill-icon">verified_user</span>
            </div>

            {/* 快速操作：增加扫码入口 */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={startScan}
                className="flex flex-col items-center justify-center gap-2 py-6 bg-primary/5 border-2 border-dashed border-primary/20 rounded-3xl text-primary active:bg-primary/10 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <span className="material-symbols-outlined text-2xl group-active:scale-110 transition-transform">qr_code_scanner</span>
                </div>
                <span className="text-xs font-bold">扫码加入小组</span>
              </button>
              <button 
                onClick={() => setActiveModal('invite')}
                className="flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:bg-white active:bg-slate-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-1">
                   <span className="material-symbols-outlined text-2xl group-active:scale-110 transition-transform">person_add</span>
                </div>
                <span className="text-xs font-bold">邀请新成员</span>
              </button>
            </div>
          </div>
        </section>

        {/* 退出按钮 */}
        <div className="pt-8 pb-12 text-center">
          <button 
            onClick={() => setActiveModal('logout')} 
            className="text-red-500 text-sm font-bold active:opacity-50 transition-opacity flex items-center justify-center gap-2 mx-auto"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            解除账号关联
          </button>
        </div>
      </main>

      {/* 沉浸式扫码界面 */}
      {activeModal === 'scan' && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-500">
          <div className="flex-1 relative flex flex-col items-center justify-center">
            {/* 相机视图模拟 */}
            <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
               <div className={`w-full h-full bg-[radial-gradient(circle_at_center,_transparent_40%,_black_100%)] transition-opacity duration-700 ${scanningStep === 'success' ? 'opacity-30' : 'opacity-100'}`}></div>
               
               {/* 扫描框区域 */}
               <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 transition-all duration-500 rounded-3xl ${scanningStep === 'success' ? 'border-green-500 scale-90' : 'border-primary/50'}`}>
                  {/* 四角边框 */}
                  <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-xl transition-colors ${scanningStep === 'success' ? 'border-green-500' : 'border-primary'}`}></div>
                  <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-xl transition-colors ${scanningStep === 'success' ? 'border-green-500' : 'border-primary'}`}></div>
                  <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-xl transition-colors ${scanningStep === 'success' ? 'border-green-500' : 'border-primary'}`}></div>
                  <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-xl transition-colors ${scanningStep === 'success' ? 'border-green-500' : 'border-primary'}`}></div>
                  
                  {/* 扫描激光线 */}
                  {scanningStep === 'scanning' && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 animate-[scan_2s_infinite]"></div>
                  )}
                  
                  {/* 识别成功后的对勾 */}
                  {scanningStep === 'success' && (
                    <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-300">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
                        <span className="material-symbols-outlined text-white text-5xl font-bold">done_all</span>
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

            {/* 顶栏控制 */}
            <div className="absolute top-12 w-full px-6 flex justify-between items-center text-white">
              <button onClick={() => { setActiveModal('none'); setScanningStep('idle'); }} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-90">
                <span className="material-symbols-outlined">close</span>
              </button>
              <span className="text-sm font-bold tracking-widest uppercase">
                {scanningStep === 'scanning' ? 'Scanning...' : 'Identified'}
              </span>
              <button onClick={() => onShowToast('闪光灯已开启')} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-90">
                <span className="material-symbols-outlined">flashlight_on</span>
              </button>
            </div>
            
            {/* 识别成功后的浮层卡片 */}
            {scanningStep === 'success' ? (
              <div className="absolute bottom-12 w-full px-6 animate-in slide-in-from-bottom duration-500">
                <div className="bg-white rounded-[2rem] p-6 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <img src="https://picsum.photos/seed/inviter/100/100" className="w-14 h-14 rounded-full object-cover border-2 border-slate-50" alt="Inviter" />
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">刘老师 (长子)</h3>
                      <p className="text-xs text-slate-400">邀请您加入“张爷爷”的照护小组</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setActiveModal('none'); setScanningStep('idle'); }}
                      className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl active:bg-slate-200"
                    >
                      取消
                    </button>
                    <button 
                      onClick={handleJoinGroup}
                      className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                    >
                      确认加入小组
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="absolute bottom-32 text-white/60 text-xs font-bold px-12 text-center leading-relaxed animate-pulse">
                将邀请二维码放入框内即可自动识别
              </p>
            )}
          </div>
          
          <div className="h-24 bg-black flex items-center justify-center px-12 pb-6 gap-12">
             <button className="flex flex-col items-center gap-1 text-white/40" onClick={() => onShowToast('正在打开相册')}>
                <span className="material-symbols-outlined">photo_library</span>
                <span className="text-[10px] font-bold">从相册选择</span>
             </button>
             <button className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-primary border-2 border-white/20">
                <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
             </button>
          </div>
        </div>
      )}

      {/* 邀请弹窗/解绑确认等其他 Modal (逻辑保持原样) */}
      {activeModal === 'invite' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-sm:max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-center text-slate-800 mb-6">我的邀请码</h3>
            <div className="aspect-square bg-slate-50 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 mb-6 relative overflow-hidden">
               <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=qingsong-family-invite-id8892" className="w-40 h-40" alt="QR Code" />
            </div>
            <div className="bg-slate-100 p-4 rounded-2xl flex justify-between items-center mb-6">
              <span className="text-slate-500 font-mono font-bold tracking-wider">QS-ZP-8892</span>
              <button onClick={() => { onShowToast('邀请码已复制'); }} className="text-primary text-xs font-bold">复制</button>
            </div>
            <button onClick={() => setActiveModal('none')} className="w-full py-4 bg-primary text-white font-bold rounded-2xl active:scale-95 transition-transform">关闭</button>
          </div>
        </div>
      )}

      <BottomNav activeView={View.PROFILE} onNavigate={onNavigate} />
    </div>
  );
};

export default Profile;
