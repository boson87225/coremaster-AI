import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { PlanContext } from '../context/PlanContext';
import { getAiInsightTip, triggerKeySetup, getEffectiveApiKey } from '../services/geminiService';
import { Sparkles, Loader2, RefreshCw, Dumbbell, Activity, User, History, Zap, UtensilsCrossed, ShieldAlert, ArrowRight, CheckCircle, Scale, Download, Share2, HeartPulse, BrainCircuit } from './icons';
import { useTranslation } from '../context/LanguageContext';
import type { Page } from '../types';

const InstallAppCard: React.FC = () => {
    const { t } = useTranslation();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIos, setIsIos] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        setIsIos(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    if (isStandalone) return null;
    
    if (!deferredPrompt && !isIos) return null;

    return (
        <div className="mb-6 p-5 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-[2rem] border border-cyan-500/30 relative overflow-hidden animate-fade-in">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500 text-white rounded-2xl shadow-lg shadow-cyan-500/20">
                    <Download size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Install App</h3>
                    <p className="text-[10px] text-cyan-200 font-medium mt-1">
                        {isIos ? 'Tap Share and "Add to Home Screen"' : 'Install for the best experience'}
                    </p>
                </div>
            </div>
            {!isIos && (
                <button 
                    onClick={handleInstall}
                    className="mt-4 w-full py-3 bg-white text-slate-900 font-black rounded-xl uppercase tracking-widest text-[10px] hover:bg-cyan-50 transition-colors shadow-lg"
                >
                    Install Now
                </button>
            )}
             {isIos && (
                <div className="mt-3 text-[10px] text-slate-300 bg-black/20 p-2 rounded-lg flex items-center gap-2">
                    <Share2 size={12} /> <span>Tap Share &rarr; Add to Home Screen</span>
                </div>
            )}
        </div>
    )
}

const AiStatusBanner: React.FC = () => {
    const [isLinked, setIsLinked] = useState<boolean>(true);
    const [isSettingUp, setIsSettingUp] = useState(false);
    const { t } = useTranslation();

    const checkStatus = useCallback(async () => {
        if (getEffectiveApiKey() !== "") {
            setIsLinked(true);
            return;
        }
        if (localStorage.getItem('coremaster_demo_active') === 'true') {
            setIsLinked(true);
            return;
        }
        if (typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey) {
            const result = await (window as any).aistudio.hasSelectedApiKey();
            setIsLinked(result);
        } else {
            setIsLinked(false);
        }
    }, []);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 3000);
        return () => clearInterval(interval);
    }, [checkStatus]);

    const handleSetup = async () => {
        setIsSettingUp(true);
        try {
            await triggerKeySetup();
            setIsLinked(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSettingUp(false);
        }
    };

    if (isLinked) return null;

    return (
        <button 
            onClick={handleSetup}
            disabled={isSettingUp}
            className={`w-full mb-6 p-4 rounded-[1.5rem] flex items-center justify-between group transition-all duration-300 ${
                isSettingUp 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 animate-pulse'
            }`}
        >
            <div className="flex items-center gap-3 text-left">
                <div className={`p-2 rounded-xl shadow-lg transition-colors ${isSettingUp ? 'bg-slate-700' : 'bg-orange-500 text-white'}`}>
                    {isSettingUp ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
                </div>
                <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">
                        {isSettingUp ? 'Linking AI Core...' : 'AI Core Required'}
                    </p>
                    <p className="text-[10px] text-orange-400 font-bold">
                        {isSettingUp ? 'Connecting to cloud' : 'Tap to Activate Demo Mode for Vercel'}
                    </p>
                </div>
            </div>
            {!isSettingUp && <ArrowRight size={18} className="text-orange-400 group-hover:translate-x-1 transition-transform" />}
        </button>
    );
}

const AiInsight: React.FC = () => {
    const { t, language } = useTranslation();
    const { activeWorkoutPlan, weightLog, userProfile } = useContext(PlanContext);
    const [tip, setTip] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateTip = useCallback(async () => {
        setIsLoading(true);
        try {
            const insightData = {
                goal: userProfile?.goal,
                todayWorkoutFocus: activeWorkoutPlan?.days[0]?.focus,
                weight: weightLog[0]?.weight
            };
            const newTip = await getAiInsightTip(insightData, language);
            setTip(newTip);
            sessionStorage.setItem('coreMasterTip', newTip);
        } catch (err: any) {
            console.error("AI Insight Error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkoutPlan, weightLog, userProfile, language]);

    useEffect(() => {
        const cachedTip = sessionStorage.getItem('coreMasterTip');
        if (cachedTip) setTip(cachedTip); else generateTip();
    }, [generateTip]);

    return (
        <div className="glass-bright p-5 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="flex justify-between items-center mb-3 relative">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-500 text-white rounded-2xl shadow-lg shadow-cyan-500/20"><Sparkles className="w-4 h-4" /></div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">{t('AI_INSIGHT_TITLE')}</h3>
                </div>
                <button onClick={() => { sessionStorage.removeItem('coreMasterTip'); generateTip(); }} disabled={isLoading} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>
            
            {isLoading ? (
                <div className="flex items-center gap-3 py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating Strategy...</p>
                </div>
            ) : tip ? (
                <p className="text-white text-sm font-semibold">
                    {tip}
                </p>
            ) : null}
        </div>
    );
}

// Updated Body Analysis Component
const BodyStatusAnalysis: React.FC = () => {
    const { userProfile, weightLog } = useContext(PlanContext);
    
    // Safety check
    if (!userProfile) return null;

    const currentWeight = weightLog.length > 0 ? weightLog[0].weight : userProfile.weight;
    const heightM = userProfile.height / 100;
    const bmi = currentWeight / (heightM * heightM);
    
    let statusLabel = "";
    let statusColor = "";
    let advice = "";
    let icon = null;

    if (bmi < 18.5) {
        statusLabel = "Underweight / Ectomorph";
        statusColor = "text-yellow-400";
        advice = "專注於肌肥大訓練與熱量盈餘，多攝取優質碳水。";
        icon = <UtensilsCrossed size={16} className="text-yellow-400" />;
    } else if (bmi >= 18.5 && bmi < 24.9) {
        statusLabel = "Optimal / Athletic";
        statusColor = "text-emerald-400";
        advice = "目前處於最佳狀態，可專注於提升運動表現與力量。";
        icon = <Activity size={16} className="text-emerald-400" />;
    } else if (bmi >= 25 && bmi < 29.9) {
        statusLabel = "Overweight / Endomorph";
        statusColor = "text-orange-400";
        advice = "建議增加有氧頻率與代謝阻力訓練，控制碳水攝取。";
        icon = <HeartPulse size={16} className="text-orange-400" />;
    } else {
        statusLabel = "High BMI / Power";
        statusColor = "text-red-400";
        advice = "優先考慮低衝擊有氧與關節友善的肌力訓練。";
        icon = <ShieldAlert size={16} className="text-red-400" />;
    }

    return (
        <div className="glass p-5 rounded-[2.5rem] border-t border-white/10 relative overflow-hidden">
            {/* Background Chart Effect */}
            <div className="absolute right-0 bottom-0 w-32 h-16 opacity-10">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                    <path d="M0,50 Q25,10 50,30 T100,20" fill="none" stroke="currentColor" strokeWidth="2" className={statusColor} />
                </svg>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <BrainCircuit size={16} className={statusColor} />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Body Analysis</h3>
            </div>

            <div className="flex items-end justify-between mb-2">
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Current State</span>
                    <span className={`text-lg font-black uppercase tracking-tight ${statusColor}`}>
                        {statusLabel}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">BMI</span>
                    <span className="text-2xl font-black text-white">{bmi.toFixed(1)}</span>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    <span className="font-bold text-cyan-400 mr-1">AI 建議:</span> {advice}
                </p>
            </div>
        </div>
    );
};

const ProgressSnapshot: React.FC = () => {
    const { activeNutritionPlan, weightLog, foodLog } = useContext(PlanContext);
    const { t } = useTranslation();

    const weightData = useMemo(() => {
        if (weightLog.length === 0) return { value: '--', trend: null };
        const latest = weightLog[0].weight.toFixed(1);
        return { value: latest };
    }, [weightLog]);

    const calorieData = useMemo(() => {
        if (!activeNutritionPlan) return { current: 0, target: 0 };
        const today = new Date().toDateString();
        const todaysCalories = foodLog
            .filter(item => new Date(item.timestamp).toDateString() === today)
            .reduce((sum, item) => sum + item.calories, 0);
        return { current: Math.round(todaysCalories), target: activeNutritionPlan.dailyCalorieTarget };
    }, [foodLog, activeNutritionPlan]);

    return (
        <div className="grid grid-cols-1 gap-4">
            <div className="glass p-6 rounded-[2.5rem] flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('LATEST_WEIGHT')}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white glow-text-cyan">{weightData.value}</span>
                        <span className="text-sm font-bold text-slate-500">KG</span>
                    </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                    <Scale className="text-cyan-400" size={24} />
                </div>
            </div>
            
            <div className="glass p-6 rounded-[2.5rem]">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('TODAY_CALORIES')}</p>
                    <span className="text-xs font-mono font-bold text-emerald-400">{calorieData.current} / {calorieData.target || '--'} kcal</span>
                </div>
                <div className="w-full h-3 bg-slate-900/50 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000" 
                        style={{ width: `${calorieData.target ? Math.min((calorieData.current/calorieData.target)*100, 100) : 0}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}

export const HomePage: React.FC<{ setPage: (page: Page) => void; }> = ({ setPage }) => {
    const { activeWorkoutPlan } = useContext(PlanContext);
    const { t } = useTranslation();

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">
                        Core<span className="text-cyan-500">Master</span>
                    </h1>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] font-bold mt-1">Optimization Protocol</p>
                </div>
                <button onClick={() => setPage('profile')} className="w-12 h-12 rounded-2xl glass flex items-center justify-center border border-white/10 hover:border-cyan-500 transition-colors">
                    <User size={20} className="text-slate-200" />
                </button>
            </header>

            <InstallAppCard />
            <AiStatusBanner />

            {!activeWorkoutPlan ? (
                <div className="glass p-10 rounded-[3rem] text-center space-y-8 border-t-2 border-cyan-500/30">
                    <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/20 transform rotate-3">
                        <Dumbbell className="w-12 h-12 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{t('HOME_NO_PLAN_TITLE')}</h2>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium px-4">{t('HOME_NO_PLAN_DESC')}</p>
                    </div>
                    <button onClick={() => setPage('ai_planner')} className="w-full py-5 bg-white text-slate-900 font-black rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs">
                        {t('HOME_CTA_AI_PLANNER')}
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <AiInsight />
                    {/* Replaced SynergyStatus with BodyStatusAnalysis */}
                    <BodyStatusAnalysis />
                    <ProgressSnapshot />
                    
                    <div className="grid grid-cols-2 gap-4">
                         <button onClick={() => setPage('workout')} className="glass-bright p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-cyan-500/10 transition-colors group">
                            <Activity size={24} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{t('NAV_WORKOUT')}</span>
                         </button>
                         <button onClick={() => setPage('tracker')} className="glass-bright p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-indigo-500/10 transition-colors group">
                            <History size={24} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{t('NAV_TRACKER')}</span>
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
};