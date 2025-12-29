
import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { PlanContext } from '../context/PlanContext';
import { getAiInsightTip, triggerKeySetup, getEffectiveApiKey } from '../services/geminiService';
import { Sparkles, Loader2, RefreshCw, Dumbbell, Activity, User, History, Zap, UtensilsCrossed, ShieldAlert, ArrowRight, CheckCircle, Scale, Download, Share2, HeartPulse, BrainCircuit, Bot, Settings, ClipboardList, Flame, Wind, Trophy } from './icons';
import { useTranslation } from '../context/LanguageContext';
import { BodyAvatar } from './BodyAvatar';
import { ALL_SPECIALIZED_PLANS } from '../constants';
import type { Page } from '../types';

// --- 新增：當前計畫總覽卡片 ---
const ActivePlanOverview: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
    const { activeWorkoutPlan } = useContext(PlanContext);
    
    if (!activeWorkoutPlan) return null;

    // 嘗試尋找對應的專項計畫資料以獲取圖片與詳細資訊
    const specPlan = activeWorkoutPlan.sportKey 
        ? ALL_SPECIALIZED_PLANS.find(p => p.key === activeWorkoutPlan.sportKey) 
        : null;

    return (
        <div 
            className="relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl group cursor-pointer transition-transform active:scale-[0.98]" 
            onClick={() => setPage('my_plan')}
        >
            {/* Background Layer */}
            <div className="absolute inset-0 bg-slate-900">
               {specPlan ? (
                   <img src={specPlan.imageUrl} className="w-full h-full object-cover opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-1000 grayscale group-hover:grayscale-0" alt="Plan Bg" />
               ) : (
                   <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-black opacity-80"></div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
               
               {/* Decorative Grid */}
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>

            <div className="relative z-10 p-6 space-y-5">
                {/* Top Badge Row */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        {specPlan ? (
                            <span className="px-2.5 py-1 bg-cyan-500 text-slate-950 text-[9px] font-black uppercase rounded-lg tracking-widest shadow-lg shadow-cyan-500/20">
                                {specPlan.sport} Protocol
                            </span>
                        ) : (
                            <span className="px-2.5 py-1 bg-indigo-500 text-white text-[9px] font-black uppercase rounded-lg tracking-widest shadow-lg shadow-indigo-500/20">
                                AI Generated
                            </span>
                        )}
                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300 uppercase tracking-widest border border-white/10 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md">
                            <Activity size={10} className="text-emerald-400 animate-pulse" /> Active
                        </span>
                    </div>

                    {/* Energy System Indicators (Only for Specialized Plans) */}
                    {specPlan && (
                        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                            {specPlan.primarySystems.map(s => {
                                if(s.includes('ATP')) return <div key={s} title="ATP-PCr (Explosive)" className="p-1 rounded-md bg-red-500/20 text-red-400"><Zap size={12} /></div>;
                                if(s.includes('糖')) return <div key={s} title="Glycolytic (Anaerobic)" className="p-1 rounded-md bg-yellow-500/20 text-yellow-400"><Flame size={12} /></div>;
                                if(s.includes('氧化')) return <div key={s} title="Oxidative (Aerobic)" className="p-1 rounded-md bg-cyan-500/20 text-cyan-400"><Wind size={12} /></div>;
                                return null;
                            })}
                        </div>
                    )}
                </div>

                {/* Title & Info */}
                <div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-xl">
                        {activeWorkoutPlan.planTitle}
                    </h3>
                    <p className="text-[10px] font-medium text-slate-300 mt-2 line-clamp-2 leading-relaxed opacity-80">
                        {activeWorkoutPlan.planSummary}
                    </p>
                </div>

                {/* Progress Bar & CTA */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span>Current Cycle Progress</span>
                        <span>Day {activeWorkoutPlan.days[0].day} / {activeWorkoutPlan.days.length}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] w-1/3"></div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Today's Focus</span>
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                            <Trophy size={14} className="text-yellow-400" />
                            {activeWorkoutPlan.days[0].focus}
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-[-10deg] transition-all">
                        <ArrowRight size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
};

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
                    <button onClick={() => setPage('settings')} className="p-2 text-slate-500 hover:text-white transition-colors"><Settings size={18}/></button>
                </div>
            </header>

            {!activeWorkoutPlan ? (
                <div className="glass p-10 rounded-[3rem] text-center space-y-8 border-t-2 border-cyan-500/30">
                    <div className="w-20 h-20 bg-cyan-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/20"><Dumbbell className="text-slate-950" size={32} /></div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{t('HOME_NO_PLAN_DESC')}</p>
                    <button onClick={() => setPage('my_plan')} className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-cyan-50 transition-colors shadow-lg">
                        <ClipboardList size={14} /> 選擇訓練計畫
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* 1. 當前計畫總覽 (The Main Dashboard Widget) */}
                    <ActivePlanOverview setPage={setPage} />

                    {/* 2. 身體狀態 (Digital Twin) */}
                    <BodyStatusAnalysis />
                    
                    {/* 3. 數據快照 */}
                    <ProgressSnapshot />
                    
                    {/* 4. 快速導航 */}
                    <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => setPage('workout')} className="bg-slate-900/40 hover:bg-slate-800 border border-white/5 hover:border-cyan-500/30 p-4 rounded-2xl flex items-center gap-3 transition-all group">
                            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform"><Activity size={18} /></div>
                            <span className="text-[10px] font-black uppercase text-white tracking-widest">Training Mode</span>
                         </button>
                         <button onClick={() => setPage('tracker')} className="bg-slate-900/40 hover:bg-slate-800 border border-white/5 hover:border-indigo-500/30 p-4 rounded-2xl flex items-center gap-3 transition-all group">
                            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform"><History size={18} /></div>
                            <span className="text-[10px] font-black uppercase text-white tracking-widest">Logs & History</span>
                         </button>
                    </div>

                    {/* 5. AI Coach Status */}
                    <div className="glass p-6 rounded-[2rem] border border-white/5 flex items-center gap-4 cursor-pointer hover:border-cyan-500/20 transition-all">
                         <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-cyan-500/10">
                            <Bot size={20} />
                         </div>
                         <div>
                             <p className="text-[10px] font-black text-white uppercase tracking-widest">AI Coach Online</p>
                             <p className="text-[9px] text-slate-500">System Ready. Awaiting input.</p>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};
