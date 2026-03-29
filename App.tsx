import React, { useCallback, useState } from 'react';
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
import { storage } from './lib/storage';
import { View } from './types';

const App: React.FC = () => {
  const hasToken = typeof window !== 'undefined' && Boolean(storage.getAccessToken());
  const [currentView, setCurrentView] = useState<View>(hasToken ? View.HOME : View.INTRO);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  const showToast = useCallback((message: string) => {
    setToast({ message, show: true });
    window.setTimeout(() => setToast({ message: '', show: false }), 2500);
  }, []);

  const navigateTo = (view: View, params?: Record<string, unknown>) => {
    if (view === View.ORG_DETAILS && typeof params?.id === 'string') {
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
        return (
          <Login
            onLogin={() => {
              showToast('欢迎回来，登录成功');
              navigateTo(View.HOME);
            }}
          />
        );
      case View.HOME:
        return <Home onSelectOrg={(id) => navigateTo(View.ORG_DETAILS, { id })} onNavigate={navigateTo} onShowToast={showToast} />;
      case View.ORG_DETAILS:
        return (
          <OrgDetails
            orgId={selectedOrgId}
            onBack={() => navigateTo(View.HOME)}
            onSign={() => navigateTo(View.SIGNING)}
            onNavigate={navigateTo}
            onShowToast={showToast}
          />
        );
      case View.SIGNING:
        return (
          <SigningProcess
            institutionId={selectedOrgId}
            onBack={() => navigateTo(View.ORG_DETAILS, { id: selectedOrgId })}
            onComplete={() => {
              showToast('签约申请已提交');
              navigateTo(View.ORDERS);
            }}
            onShowToast={showToast}
          />
        );
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
    <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col overflow-x-hidden bg-background font-sans shadow-2xl">
      {renderView()}

      <div
        className={`fixed left-1/2 top-10 z-[100] -translate-x-1/2 transform transition-all duration-300 ${
          toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 rounded-full bg-slate-900/90 px-6 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-md">
          <span className="material-symbols-outlined text-lg text-primary">info</span>
          {toast.message}
        </div>
      </div>
    </div>
  );
};

export default App;
