
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { HomePage } from './components/HomePage';
import { MyPlanPage } from './components/MyPlanPage';
import { WorkoutPage } from './components/WorkoutPage';
import { TrackerPage } from './components/TrackerPage';
import { ProfilePage } from './components/ProfilePage';
import { AiPlannerPage } from './components/AiPlannerPage';
import { ManualPlannerPage } from './components/ManualPlannerPage';
import { SettingsPage } from './components/SettingsPage';
import { Home, Dumbbell, History, Loader2, User, BrainCircuit, ClipboardList, WifiOff, ShieldAlert, Settings, Bot, X } from './components/icons';
import type { Page } from './types';
import { WorkoutProvider } from './context/WorkoutContext';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import { PlanProvider, PlanContext } from './context/PlanContext';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { SplashScreen } from './components/SplashScreen';
import { RegistrationPage } from './components/RegistrationPage';
import { ChatInterface } from './components/ChatInterface';
import { AI_COACH_SYSTEM_INSTRUCTION } from './constants';

const FloatingCoach: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <>
            {/* AI 浮球 */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-24 right-6 z-[70] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all duration-500 hover:scale-110 active:scale-90 ${isOpen ? 'bg-slate-800 rotate-90 border border-cyan-500/30' : 'bg-cyan-500 text-slate-900'}`}
            >
                {isOpen ? <X size={24} /> : <Bot size={28} className="animate-pulse" />}
            </button>

            {/* 展開式對話介面 */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex flex-col p-4 pt-16 animate-fade-in bg-slate-950/60 backdrop-blur-md">
                    <div className="flex-grow max-w-lg mx-auto w-full shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/10">
                         <ChatInterface 
                            title="Neural Assistant"
                            icon={<Bot size={16} className="text-cyan-500" />}
                            initialMessage="您好，我是您的 AI 健身助理。今天有什麼我可以幫您的嗎？您可以隨時詢問訓練建議或飲食方針。"
                            systemInstruction={AI_COACH_SYSTEM_INSTRUCTION}
                            sessionKey="global_ai_coach"
                            accentColor="bg-slate-900"
                        />
                    </div>
                    <button onClick={() => setIsOpen(false)} className="mt-4 mx-auto w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                        <X size={20} />
                    </button>
                </div>
            )}
        </>
    );
};

const AppContent: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiRevoked, setApiRevoked] = useState(false);
  const { t } = useTranslation();
  const [showSplash, setShowSplash] = useState(true);
  const { userProfile, isLoaded } = useContext(PlanContext);

  useEffect(() => {
    const handleRevoked = () => {
        setApiRevoked(true);
        setPage('settings');
    };
    window.addEventListener('coremaster-api-revoked', handleRevoked);
    return () => window.removeEventListener('coremaster-api-revoked', handleRevoked);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(splashTimer);
  }, []);
  
  useEffect(() => {
    setUserId(`user-${crypto.randomUUID().substring(0, 8)}`);
    setIsAuthReady(true);
  }, []);

  const renderPage = useCallback(() => {
    switch (page) {
      case 'home': return <HomePage setPage={setPage} />;
      case 'my_plan': return <MyPlanPage setPage={setPage} />;
      case 'workout': return <WorkoutPage userId={userId} />;
      case 'tracker': return <TrackerPage userId={userId} />;
      case 'profile': return <ProfilePage userId={userId} setPage={setPage} />;
      case 'ai_planner': return <AiPlannerPage setPage={setPage}/>;
      case 'manual_planner': return <ManualPlannerPage setPage={setPage} />;
      case 'settings': return <SettingsPage userId={userId} setPage={setPage} />;
      default: return <div className="text-center p-4">Page not found</div>;
    }
  }, [page, userId]);

  if (showSplash) return <SplashScreen />;
  
  if (!isLoaded || !isAuthReady) {
      return (
        <div className="flex flex-col justify-center items-center h-screen bg-slate-950">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
          <p className="mt-6 text-sm font-mono tracking-widest text-cyan-400/60 uppercase">Initializing Core...</p>
        </div>
      );
  }
  
  if (!userProfile) return <RegistrationPage />;

  return (
    <div className="min-h-screen text-slate-200 flex flex-col selection:bg-cyan-500/30">
      {apiRevoked && (
          <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 flex justify-between items-center animate-pulse sticky top-0 z-[100]">
              <span className="flex items-center gap-2"><ShieldAlert size={12}/> API Key 已失效，請更新金鑰</span>
              <button onClick={() => setApiRevoked(false)} className="underline">關閉</button>
          </div>
      )}

      <header className="bg-slate-950/40 backdrop-blur-xl border-b border-white/5 p-4 flex flex-col items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
           <Dumbbell className="w-6 h-6 text-cyan-400" />
           <h1 className="text-lg font-extrabold text-white tracking-tighter uppercase">CoreMaster <span className="text-cyan-400">Fitness</span></h1>
        </div>
      </header>
      
      <main className="flex-grow p-4 pb-32 max-w-2xl mx-auto w-full">
        {renderPage()}
      </main>
      
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass rounded-2xl shadow-2xl z-40 px-2 py-1">
        <div className="flex justify-around items-center h-14">
          <button onClick={() => setPage('home')} className={`p-2 transition-all ${page === 'home' ? 'text-cyan-400 scale-125' : 'text-slate-500'}`}><Home size={22} /></button>
          <button onClick={() => setPage('my_plan')} className={`p-2 transition-all ${page === 'my_plan' ? 'text-cyan-400 scale-125' : 'text-slate-500'}`}><ClipboardList size={22} /></button>
          <button onClick={() => setPage('workout')} className={`p-2 transition-all ${page === 'workout' ? 'text-cyan-400 scale-125' : 'text-slate-500'}`}><Dumbbell size={22} /></button>
          <button onClick={() => setPage('tracker')} className={`p-2 transition-all ${page === 'tracker' ? 'text-cyan-400 scale-125' : 'text-slate-500'}`}><History size={22} /></button>
          <button onClick={() => setPage('profile')} className={`p-2 transition-all ${page === 'profile' ? 'text-cyan-400 scale-125' : 'text-slate-500'}`}><User size={22} /></button>
        </div>
      </nav>

      <FloatingCoach />
      <WorkoutPlayer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <PlanProvider>
        <WorkoutProvider>
          <AppContent />
        </WorkoutProvider>
      </PlanProvider>
    </LanguageProvider>
  );
}
