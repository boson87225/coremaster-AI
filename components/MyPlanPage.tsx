
import React, { useContext, useMemo, useState } from 'react';
import { PlanContext } from '../context/PlanContext';
import { ClipboardList, Zap, Sparkles, UtensilsCrossed, Trash2, Edit, Activity, BrainCircuit, Target, Trophy, Info, Flame, ShieldCheck, RefreshCw, Loader2, List, Target as Crosshair, Plus, ArrowRight, X } from './icons';
import type { Page, WorkoutPlan, SpecializedPlan, NutritionPlan } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { WorkoutPlanCard } from './WorkoutPlanCard';
import { getAiNutritionPlan } from '../services/geminiService';

interface MyPlanPageProps {
    setPage: (page: Page) => void;
}

const NutritionDashboard: React.FC<{ 
    workoutPlan: WorkoutPlan, 
    nutritionPlan: NutritionPlan | null,
    onUpdated: (p: NutritionPlan) => void 
}> = ({ workoutPlan, nutritionPlan, onUpdated }) => {
    const { t } = useTranslation();
    const { userProfile, weightLog } = useContext(PlanContext);
    const [isLoading, setIsLoading] = useState(false);

    // 核心邏輯：自動計算 TDEE 並生成飲食 (不再需要 Modal)
    const handleGenerateAutomatically = async () => {
        if (!userProfile) return;
        setIsLoading(true);
        
        try {
            // 1. 抓取最新數據：優先讀取 Tracker 紀錄，否則使用註冊資料
            const latestWeight = weightLog.length > 0 ? weightLog[0].weight : userProfile.weight;
            const { gender, age, height, goal } = userProfile;
            
            // 2. 內部 TDEE 計算 (Mifflin-St Jeor)
            let bmr = gender === 'male' 
                ? (10 * latestWeight) + (6.25 * height) - (5 * age) + 5
                : (10 * latestWeight) + (6.25 * height) - (5 * age) - 161;
            
            // 假設中度活動量 (1.55) 作為標準基準
            const calculatedTdee = bmr * 1.55;
            
            const goalStr = t(`GOAL_${goal.toUpperCase() as any}`) || goal;
            const plan = await getAiNutritionPlan(goalStr, calculatedTdee, workoutPlan);
            onUpdated(plan);
        } catch (e) {
            console.error(e);
            alert("飲食建議產生失敗，請確認 API Key。");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 glass rounded-[3rem] border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-emerald-950/10 to-slate-950 relative overflow-hidden">
             <div className="absolute -right-12 -bottom-12 opacity-5 rotate-12 text-emerald-500"><UtensilsCrossed size={180} /></div>
             
             <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl shadow-lg shadow-emerald-500/20"><UtensilsCrossed size={18} /></div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Neural Nutrition</h3>
                        <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Dynamic Sync Enabled</p>
                    </div>
                </div>
                {nutritionPlan && (
                    <button onClick={handleGenerateAutomatically} className="p-2 rounded-xl bg-white/5 border border-white/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 transition-all">
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                    </button>
                )}
             </div>

             {isLoading ? (
                 <div className="py-10 flex flex-col items-center gap-4 animate-pulse">
                     <Loader2 className="animate-spin text-emerald-500" size={32} />
                     <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Calibrating Macros...</p>
                 </div>
             ) : nutritionPlan ? (
                 <div className="space-y-6 relative z-10">
                     <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block mb-1">AI Body Sync Insight</span>
                        <p className="text-[10px] text-slate-300 italic leading-relaxed">{nutritionPlan.summary}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                            <span className="text-[8px] font-black text-emerald-500/60 uppercase block mb-1">Workout Burn</span>
                            <span className="text-xl font-black text-white">{Math.round(nutritionPlan.estimatedWorkoutCalories)}<span className="text-[10px] ml-1">kcal</span></span>
                        </div>
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                            <span className="text-[8px] font-black text-emerald-500/60 uppercase block mb-1">Daily Budget</span>
                            <span className="text-xl font-black text-white">{Math.round(nutritionPlan.dailyCalorieTarget)}<span className="text-[10px] ml-1">kcal</span></span>
                        </div>
                     </div>

                     <div className="space-y-2">
                        {nutritionPlan.meals.map((meal, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/10">
                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-black text-emerald-500 text-[10px]">{idx+1}</div>
                                <div className="flex-grow">
                                    <p className="text-xs font-black text-white uppercase">{meal.name}</p>
                                    <p className="text-[9px] text-slate-500 truncate max-w-[150px]">{meal.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-mono font-black text-white">{meal.calories}</span>
                                    <span className="text-[7px] text-slate-600 block uppercase">KCAL</span>
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>
             ) : (
                 <div className="text-center py-6 space-y-4">
                     <p className="text-[10px] text-slate-500 font-medium px-8 leading-relaxed uppercase tracking-widest">未偵測到飲食協定。點擊下方按鈕以透過 AI 根據您的個人檔案與當前體重同步產生計畫。</p>
                     <button onClick={handleGenerateAutomatically} className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl uppercase text-[10px] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                         <Sparkles size={14} /> 同步生成 AI 飲食建議
                     </button>
                 </div>
             )}
        </div>
    );
};

export const MyPlanPage: React.FC<MyPlanPageProps> = ({ setPage }) => {
    const { activeWorkoutPlan, activeNutritionPlan, clearPlan, setActivePlan } = useContext(PlanContext);
    const { t } = useTranslation();

    if (!activeWorkoutPlan) {
        return (
            <div className="space-y-8 animate-fade-in pb-20">
                <header className="px-2">
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Plan Center</h1>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] font-bold mt-2">Architecture Hub</p>
                </header>

                <div className="grid gap-4">
                    <button onClick={() => setPage('ai_planner')} className="group relative overflow-hidden glass p-8 rounded-[2.5rem] border border-cyan-500/20 text-left transition-all hover:border-cyan-500/50">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/10 blur-[60px] group-hover:bg-cyan-500/20 transition-all"></div>
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 bg-cyan-500 text-slate-950 rounded-3xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform"><Sparkles size={28} /></div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">AI Smart Planner</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">由神經網路生成的動態課表</p>
                            </div>
                            <ArrowRight className="ml-auto text-slate-700 group-hover:text-cyan-500 transition-colors" size={24}/>
                        </div>
                    </button>

                    <button onClick={() => setPage('manual_planner')} className="group relative overflow-hidden glass p-8 rounded-[2.5rem] border border-indigo-500/20 text-left transition-all hover:border-indigo-500/50">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 blur-[60px] group-hover:bg-indigo-500/20 transition-all"></div>
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 bg-indigo-500 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform"><Edit size={28} /></div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Manual Creator</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">完全自定義的訓練週期與動作</p>
                            </div>
                            <ArrowRight className="ml-auto text-slate-700 group-hover:text-indigo-500 transition-colors" size={24}/>
                        </div>
                    </button>

                    <button onClick={() => setPage('workout')} className="group relative overflow-hidden glass p-8 rounded-[2.5rem] border border-white/10 text-left transition-all hover:border-white/20">
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 bg-white text-slate-950 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Zap size={28} /></div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Specialized Units</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">職業運動等級的專項強化方案</p>
                            </div>
                            <ArrowRight className="ml-auto text-slate-700 group-hover:text-white transition-colors" size={24}/>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
             <div className="flex justify-between items-end px-2">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">{t('MY_PLAN_TITLE')}</h1>
                    <p className="text-xs font-bold text-cyan-400 mt-2 uppercase tracking-widest truncate max-w-[200px]">{activeWorkoutPlan.planTitle}</p>
                </div>
                <button onClick={clearPlan} className="p-3 text-red-500/50 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Active Sequence</h3>
                </div>
                <WorkoutPlanCard plan={activeWorkoutPlan} showAllDays={false} activeDayIndex={0} />
             </div>

             <NutritionDashboard 
                workoutPlan={activeWorkoutPlan} 
                nutritionPlan={activeNutritionPlan}
                onUpdated={(p) => setActivePlan(activeWorkoutPlan, p)}
             />
        </div>
    );
};
