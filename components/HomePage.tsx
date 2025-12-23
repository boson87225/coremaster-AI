import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { PlanContext } from '../context/PlanContext';
import { getAiInsightTip } from '../services/geminiService';
import { Sparkles, Loader2, RefreshCw, Dumbbell, ArrowUpRight, ArrowDownRight, Minus, Scale, HeartPulse, Activity, User, History, Zap, UtensilsCrossed } from './icons';
import { useTranslation } from '../context/LanguageContext';
import type { Page } from '../types';

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
                <p className="text-white text-sm leading-relaxed font-semibold">
                    {tip}
                </p>
            ) : null}
        </div>
    );
}

const SynergyStatus: React.FC = () => {
    // Fixed: Moved activeWorkoutPlan, activeNutritionPlan, and foodLog from useTranslation (LanguageContext)
    // to PlanContext where they are actually defined.
    const { t } = useTranslation();
    const { activeWorkoutPlan, activeNutritionPlan, foodLog, userProfile } = useContext(PlanContext);
    
    // 這裡可以模擬計算運動與飲食的配合度
    const synergyLevel = 85; 

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="glass p-5 rounded-[2rem] border-t border-white/10">
                <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Synergy Score</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{synergyLevel}</span>
                    <span className="text-xs font-bold text-slate-500">%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-3">
                    <div className="h-full bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" style={{ width: `${synergyLevel}%` }}></div>
                </div>
            </div>
            <div className="glass p-5 rounded-[2rem] border-t border-white/10">
                <div className="flex items-center gap-2 mb-3">
                    <UtensilsCrossed size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metabolic State</span>
                </div>
                <span className="text-lg font-black text-emerald-400 uppercase tracking-tighter">
                    {userProfile?.goal === 'FAT_LOSS' ? 'Burning' : 'Building'}
                </span>
                <p className="text-[10px] text-slate-500 font-bold mt-1">Optimal Range</p>
            </div>
        </div>
    );
}

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
                    <SynergyStatus />
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