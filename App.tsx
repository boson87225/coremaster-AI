
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

import { HomePage } from './components/HomePage';
import { MyPlanPage } from './components/MyPlanPage';
import { WorkoutPage } from './components/WorkoutPage';
import { TrackerPage } from './components/TrackerPage';
import { ProfilePage } from './components/ProfilePage';
import { AiCoachPage } from './components/AiCoachPage';
import { AiPlannerPage } from './components/AiPlannerPage';
import { ManualPlannerPage } from './components/ManualPlannerPage';
import { SettingsPage } from './components/SettingsPage';
import { Home, Dumbbell, History, Loader2, User, BrainCircuit, ClipboardList, WifiOff } from './components/icons';
import type { Page } from './types';

import { WorkoutProvider } from './context/WorkoutContext';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import { PlanProvider, PlanContext } from './context/PlanContext';

import { LanguageProvider, useTranslation } from './context/LanguageContext';

import { SplashScreen } from './components/SplashScreen';
import { RegistrationPage } from './components/RegistrationPage';

declare global {
  var __app_id: string | undefined;
  var __firebase_config: string | undefined;
  var __initial_auth_token: string | undefined;
}

const AppContent: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { t } = useTranslation();
  
  const [showSplash, setShowSplash] = useState(true);
  const { userProfile, isLoaded } = useContext(PlanContext);

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
      case 'ai_coach': return <AiCoachPage />;
      case 'ai_planner': return <AiPlannerPage setPage={setPage}/>;
      case 'manual_planner': return <ManualPlannerPage setPage={setPage} />;
      case 'settings': return <SettingsPage userId={userId} setPage={setPage} />;
      default: return <div className="text-center p-4">{t('PAGE_NOT_FOUND')}</div>;
    }
  }, [page, userId, t]);

  const NavButton: React.FC<{targetPage: Page, label: string, icon: React.ReactNode}> = ({targetPage, label, icon}) => (
     <button 
        onClick={() => setPage(targetPage)}
        className={`flex flex-col items-center justify-center p-2 transition-all duration-300 relative group w-14 h-14 ${page === targetPage ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <div className={`transition-transform duration-300 ${page === targetPage ? 'scale-110' : 'group-hover:scale-105'}`}>
          {icon}
        </div>
        <span className={`text-[10px] mt-1 font-bold tracking-tight transition-opacity duration-300 ${page === targetPage ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {label}
        </span>
        {page === targetPage && (
          <div className="absolute -bottom-1 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"></div>
        )}
      </button>
  );

  if (showSplash) return <SplashScreen />;
  
  if (!isLoaded || !isAuthReady) {
      return (
        <div className="flex flex-col justify-center items-center h-screen bg-slate-950">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
            <div className="absolute inset-0 blur-lg bg-cyan-500/20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-sm font-mono tracking-widest text-cyan-400/60 uppercase">{t('INITIALIZING')}</p>
        </div>
      );
  }
  
  if (!userProfile) return <RegistrationPage />;

  return (
    <div className="min-h-screen text-slate-200 flex flex-col selection:bg-cyan-500/30">
      <header className="bg-slate-950/40 backdrop-blur-xl border-b border-white/5 p-4 flex flex-col items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
           <Dumbbell className="w-6 h-6 text-cyan-400" />
           <h1 className="text-lg font-extrabold text-white tracking-tighter uppercase">CoreMaster <span className="text-cyan-400">Fitness</span></h1>
        </div>
        {!isOnline && (
          <div className="mt-2 flex items-center gap-2 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-orange-500/30">
            <WifiOff size={10} /> {t('OFFLINE_MODE')}
          </div>
        )}
      </header>
      
      <main className="flex-grow p-4 pb-28 max-w-2xl mx-auto w-full">
        {renderPage()}
      </main>
      
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass rounded-2xl shadow-2xl z-40 px-2 py-1">
        <div className="flex justify-around items-center h-14">
          <NavButton targetPage="home" label={t('NAV_HOME')} icon={<Home size={22} />} />
          <NavButton targetPage="my_plan" label={t('NAV_MY_PLAN')} icon={<ClipboardList size={22} />} />
          <NavButton targetPage="workout" label={t('NAV_WORKOUT')} icon={<Dumbbell size={22} />} />
          <NavButton targetPage="tracker" label={t('NAV_TRACKER')} icon={<History size={22} />} />
          <NavButton targetPage="ai_coach" label={t('NAV_AI_COACH')} icon={<BrainCircuit size={22} />} />
          <NavButton targetPage="profile" label={t('NAV_PROFILE')} icon={<User size={22} />} />
        </div>
      </nav>

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
