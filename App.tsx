
import React, { useState, useCallback } from 'react';
import { View } from './types';
import Intro from './pages/Intro';
import Login from './pages/Login';
import Home from './pages/Home';
import OrgDetails from './pages/OrgDetails';
import SigningProcess from './pages/SigningProcess';
import HealthData from './pages/HealthData';
import Dynamics from './pages/Dynamics';
import ServiceTracking from './pages/ServiceTracking';
import Profile from './pages/Profile';
import Orders from './pages/Orders';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.INTRO);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  const showToast = useCallback((message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 2500);
  }, []);

  const navigateTo = (view: View, params?: any) => {
    if (view === View.ORG_DETAILS && params?.id) {
      setSelectedOrgId(params.id);
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const renderView = () => {
    switch (currentView) {
      case View.INTRO:
        return <Intro onComplete={() => navigateTo(View.LOGIN)} />;
      case View.LOGIN:
        return <Login onLogin={() => { showToast('欢迎回来，登录成功'); navigateTo(View.HOME); }} />;
      case View.HOME:
        return <Home onSelectOrg={(id) => navigateTo(View.ORG_DETAILS, { id })} onNavigate={navigateTo} onShowToast={showToast} />;
      case View.ORG_DETAILS:
        return <OrgDetails orgId={selectedOrgId} onBack={() => navigateTo(View.HOME)} onSign={() => navigateTo(View.SIGNING)} onNavigate={navigateTo} onShowToast={showToast} />;
      case View.SIGNING:
        return <SigningProcess onBack={() => navigateTo(View.ORG_DETAILS, { id: selectedOrgId })} onComplete={() => { showToast('签约申请已提交'); navigateTo(View.ORDERS); }} onShowToast={showToast} />;
      case View.HEALTH:
        return <HealthData onNavigate={navigateTo} onShowToast={showToast} />;
      case View.DYNAMIC:
        return <Dynamics onNavigate={navigateTo} onShowToast={showToast} />;
      case View.SERVICE:
        return <ServiceTracking onNavigate={navigateTo} onShowToast={showToast} />;
      case View.PROFILE:
        return <Profile onNavigate={navigateTo} onShowToast={showToast} />;
      case View.ORDERS:
        return <Orders onNavigate={navigateTo} onShowToast={showToast} />;
      default:
        return <Home onSelectOrg={(id) => navigateTo(View.ORG_DETAILS, { id })} onNavigate={navigateTo} onShowToast={showToast} />;
    }
  };

  return (
    <div className="max-w-[430px] mx-auto bg-background min-h-screen shadow-2xl relative flex flex-col overflow-x-hidden font-sans">
      {renderView()}
      
      {/* Global Toast Component */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900/90 text-white px-6 py-3 rounded-full text-sm font-medium backdrop-blur-md shadow-2xl flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">info</span>
          {toast.message}
        </div>
      </div>
    </div>
  );
};

export default App;
