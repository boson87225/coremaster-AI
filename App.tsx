import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

import { HomePage } from './components/HomePage';
import { MyPlanPage } from './components/MyPlanPage';
import { WorkoutPage } from './components/WorkoutPage';
import { TrackerPage } from './components/TrackerPage';
import { ProfilePage } from './components/ProfilePage';
import { AiCoachPage } from './components/AiCoachPage';
import { AiPlannerPage } from './components/AiPlannerPage';
import { SettingsPage } from './components/SettingsPage';
import { Home, Dumbbell, History, Loader2, User, BrainCircuit, ClipboardList } from './components/icons';
import type { Page } from './types';

// New imports for Workout Player
import { WorkoutProvider } from './context/WorkoutContext';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import { PlanProvider } from './context/PlanContext';

// New import for i18n
import { LanguageProvider, useTranslation } from './context/LanguageContext';

// Declare global variables for TypeScript to recognize them from the environment
declare global {
  var __app_id: string | undefined;
  var __firebase_config: string | undefined;
  var __initial_auth_token: string | undefined;
}

// Dummy Firebase config for local development if not provided by the environment.
// This allows the app to run without a real Firebase backend for UI/UX testing.
const DUMMY_FIREBASE_CONFIG = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "project-id.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890abcdef",
};

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const isRealConfigProvided = typeof __firebase_config !== 'undefined' && __firebase_config;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;


const AppContent: React.FC = () => {
  const [page, setPage] = useState<Page>('home'); // Default to Home
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // If a real Firebase config is not provided, we'll mock the authentication
    // to allow the app to run in a demo/development environment.
    if (!isRealConfigProvided) {
      console.warn("Firebase configuration not found. Using mock user for development.");
      setUserId(`dev-user-${crypto.randomUUID().substring(0, 8)}`);
      setIsAuthReady(true);
      return;
    }

    try {
      const firebaseConfig = isRealConfigProvided ? JSON.parse(__firebase_config!) : DUMMY_FIREBASE_CONFIG;
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(auth, initialAuthToken);
            } else {
              await signInAnonymously(auth);
            }
          } catch (error: any) {
            console.error("Firebase Auth Error:", error.message);
            setAuthError(`驗證失敗： ${error.message}`);
            setUserId(`anon-${crypto.randomUUID().substring(0, 8)}`); 
          }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (error: any) {
      console.error("Firebase Initialization Error:", error.message);
      setAuthError(`初始化失敗： ${error.message}`);
      setIsAuthReady(true);
    }
  }, []);

  const renderPage = useCallback(() => {
    if (!isAuthReady) {
      return (
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
          <p className="mt-4 text-lg text-slate-300">{t('INITIALIZING')}</p>
        </div>
      );
    }

    if (authError) {
      return (
        <div className="p-4 bg-red-900/50 text-red-300 border-l-4 border-red-500 rounded-r-lg max-w-xl mx-auto">
          <h2 className="font-bold text-lg">{t('APP_ERROR')}</h2>
          <p>{authError}</p>
          <p className="mt-2 text-sm text-slate-400">App ID: {appId}</p>
        </div>
      );
    }

    switch (page) {
      case 'home': return <HomePage setPage={setPage} />;
      case 'my_plan': return <MyPlanPage setPage={setPage} />;
      case 'workout': return <WorkoutPage userId={userId} />;
      case 'tracker': return <TrackerPage userId={userId} />;
      case 'profile': return <ProfilePage userId={userId} setPage={setPage} />;
      case 'ai_coach': return <AiCoachPage />;
      case 'ai_planner': return <AiPlannerPage setPage={setPage}/>;
      case 'settings': return <SettingsPage userId={userId} setPage={setPage} />;
      default: return <div className="text-center p-4">{t('PAGE_NOT_FOUND')}</div>;
    }
  }, [page, isAuthReady, userId, authError, t]);

  const NavButton: React.FC<{targetPage: Page, label: string, icon: React.ReactNode, activeColor: string}> = ({targetPage, label, icon, activeColor}) => (
     <button 
        onClick={() => setPage(targetPage)}
        className={`flex flex-col items-center justify-center p-2 transition duration-300 rounded-lg w-16 h-16 ${page === targetPage ? `${activeColor} font-bold` : 'text-slate-400 hover:text-cyan-300'}`}
      >
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col font-sans">
      <header className="bg-slate-950/70 backdrop-blur-lg border-b border-slate-800 shadow-lg p-4 text-center sticky top-0 z-20">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">CoreMaster Fitness</h1>
      </header>
      
      <main className="flex-grow p-2 md:p-4 pb-24 max-w-2xl mx-auto w-full">
        {renderPage()}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-slate-950/80 backdrop-blur-lg border-t border-slate-800 shadow-top z-20">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          <NavButton targetPage="home" label={t('NAV_HOME')} icon={<Home className="w-6 h-6" />} activeColor="text-cyan-400 bg-cyan-500/10" />
          <NavButton targetPage="my_plan" label={t('NAV_MY_PLAN')} icon={<ClipboardList className="w-6 h-6" />} activeColor="text-cyan-400 bg-cyan-500/10" />
          <NavButton targetPage="workout" label={t('NAV_WORKOUT')} icon={<Dumbbell className="w-6 h-6" />} activeColor="text-cyan-400 bg-cyan-500/10" />
          <NavButton targetPage="tracker" label={t('NAV_TRACKER')} icon={<History className="w-6 h-6" />} activeColor="text-cyan-400 bg-cyan-500/10" />
          <NavButton targetPage="ai_coach" label={t('NAV_AI_COACH')} icon={<BrainCircuit className="w-6 h-6" />} activeColor="text-cyan-400 bg-cyan-500/10" />
          <NavButton targetPage="profile" label={t('NAV_PROFILE')} icon={<User className="w-6 h-6" />} activeColor="text-cyan-400 bg-cyan-500/10" />
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