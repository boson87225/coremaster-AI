
import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { PlanContext } from '../context/PlanContext';
import { getAiInsightTip, triggerKeySetup, getEffectiveApiKey } from '../services/geminiService';
import { Sparkles, Loader2, RefreshCw, Dumbbell, Activity, User, History, Zap, UtensilsCrossed, ShieldAlert, ArrowRight, CheckCircle, Scale, Download, Share2, HeartPulse, BrainCircuit, Bot, Settings, ClipboardList } from './icons';
import { useTranslation } from '../context/LanguageContext';
import { BodyAvatar } from './BodyAvatar';
import type { Page } from '../types';

const BodyStatusAnalysis: React.FC = () => {
    const { userProfile, weightLog, activeWorkoutPlan } = useContext(PlanContext);
    
    if (!userProfile) return null;

    const currentWeight = weightLog.length > 0 ? weightLog[0].weight : userProfile.weight;
    const heightM = userProfile.height / 100;
    const bmi = currentWeight / (heightM * heightM);
    
    let statusLabel = "";
    let statusColor = "";
    let advice = "";

    if (bmi < 18.5) {
        statusLabel = "Underweight";
        statusColor = "text-yellow-400";
        advice = "建議增加熱量盈餘，專注於重訓動作。";
    } else if (bmi >= 18.5 && bmi < 24.9) {
        statusLabel = "Optimal State";
        statusColor = "text-emerald-400";
        advice = "體態優良，可專注於特定運動專項。";
    } else {
        statusLabel = "Optimization Needed";
        statusColor = "text-orange-400";
        advice = "建議調整飲食比例，增加高強度間歇跑。";
    }

    const todayFocus = activeWorkoutPlan?.days[0]?.focus || "Standby";

    return (
        <div className="flex items-center gap-6 glass p-6 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none"></div>
            <BodyAvatar 
                gender={userProfile.gender} 
                weight={currentWeight} 
                height={userProfile.height}
                focus={todayFocus}
                hideBackground={true}
                className="w-24 h-32 flex-shrink-0"
            />
            <div className="flex-grow space-y-2 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${statusColor}`}>{statusLabel}</span>
                        <h2 className="text-xl font-black text-white uppercase italic leading-none mt-1">Twin Syncing</h2>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-slate-500 uppercase block">BMI</span>
                        <span className={`text-sm font-mono font-black ${statusColor}`}>{bmi.toFixed(1)}</span>
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug italic pt-2 border-t border-white/5">
                    <span className="text-cyan-400 font-black">AI:</span> {advice}
                </p>
            </div>
        </div>
    );
};

const ProgressSnapshot: React.FC = () => {
    const { activeNutritionPlan, weightLog, foodLog } = useContext(PlanContext);
    const { t } = useTranslation();

    const weightValue = weightLog.length > 0 ? weightLog[0].weight.toFixed(1) : '--';

    const calorieData = useMemo(() => {
        if (!activeNutritionPlan) return { current: 0, target: 0 };
        const today = new Date().toDateString();
        const current = foodLog
            .filter(item => new Date(item.timestamp).toDateString() === today)
            .reduce((sum, item) => sum + item.calories, 0);
        return { current: Math.round(current), target: activeNutritionPlan.dailyCalorieTarget };
    }, [foodLog, activeNutritionPlan]);

    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Weight</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{weightValue}</span>
                    <span className="text-[8px] font-bold text-slate-600 uppercase">KG</span>
                </div>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Energy</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-400">{calorieData.current}</span>
                    <span className="text-[8px] font-bold text-slate-600 uppercase">/ {calorieData.target || '--'}</span>
                </div>
            </div>
        </div>
    );
}

export const HomePage: React.FC<{ setPage: (page: Page) => void; }> = ({ setPage }) => {
    const { activeWorkoutPlan } = useContext(PlanContext);
    const { t } = useTranslation();

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex justify-between items-center px-1">
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">
                    Core<span className="text-cyan-500">Master</span>
                </h1>
                <div className="flex gap-2">
                    <button onClick={() => setPage('settings')} className="p-2 text-slate-500"><Settings size={18}/></button>
                </div>
            </header>

            {!activeWorkoutPlan ? (
                <div className="glass p-10 rounded-[3rem] text-center space-y-8 border-t-2 border-cyan-500/30">
                    <div className="w-20 h-20 bg-cyan-500 rounded-3xl flex items-center justify-center mx-auto"><Dumbbell className="text-white" size={32} /></div>
                    <p className="text-xs text-slate-400 leading-relaxed">{t('HOME_NO_PLAN_DESC')}</p>
                    {/* 修改處：前往計畫選擇頁面 */}
                    <button onClick={() => setPage('my_plan')} className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl uppercase text-[10px] flex items-center justify-center gap-2">
                        <ClipboardList size={14} /> 選擇訓練計畫
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <BodyStatusAnalysis />
                    <ProgressSnapshot />
                    
                    <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => setPage('workout')} className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl flex items-center gap-3">
                            <Activity size={18} className="text-cyan-400" />
                            <span className="text-[10px] font-black uppercase text-white">訓練模式</span>
                         </button>
                         <button onClick={() => setPage('tracker')} className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center gap-3">
                            <History size={18} className="text-indigo-400" />
                            <span className="text-[10px] font-black uppercase text-white">日誌歷史</span>
                         </button>
                    </div>

                    <div className="glass p-8 rounded-[2rem] border border-white/5 text-center flex flex-col items-center gap-4">
                         <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center animate-bounce">
                            <Bot size={24} />
                         </div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            AI 教練已就緒，隨時點擊右下方浮球與我對話
                         </p>
                    </div>
                </div>
            )}
        </div>
    );
};
