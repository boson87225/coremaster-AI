
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { PlanContext } from '../context/PlanContext';
import { ClipboardList, Zap, Sparkles, UtensilsCrossed, Trash2, Edit, Activity, BrainCircuit, Target, Trophy, Info, Flame, ShieldCheck, RefreshCw, Loader2, List, Crosshair, Plus, ArrowRight, X, Scale, ShieldAlert } from './icons';
import type { Page, WorkoutPlan, SpecializedPlan, NutritionPlan } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { WorkoutPlanCard } from './WorkoutPlanCard';
import { getAiNutritionPlan } from '../services/geminiService';
import { ALL_SPECIALIZED_PLANS } from '../constants';
import { BodyAvatar, AvatarAction } from './BodyAvatar';

interface MyPlanPageProps {
    setPage: (page: Page) => void;
}

// 根據運動類型或焦點，決定小人的動作
const getActionForDay = (focus: string, sportKey?: string): AvatarAction => {
    const text = (focus + ' ' + (sportKey || '')).toLowerCase();
    
    // 專項優先匹配
    if (text.includes('combat') || text.includes('格鬥') || text.includes('boxing')) return 'boxing';
    if (text.includes('run') || text.includes('跑') || text.includes('football') || text.includes('soccer')) return 'running';
    if (text.includes('jump') || text.includes('hoops') || text.includes('ball') || text.includes('plyo')) return 'jumping';
    if (text.includes('squat') || text.includes('leg') || text.includes('lower')) return 'squat';
    if (text.includes('push') || text.includes('chest') || text.includes('press')) return 'pushup'; // 或 bench
    if (text.includes('pull') || text.includes('back') || text.includes('row')) return 'row';
    if (text.includes('core') || text.includes('abs') || text.includes('plank')) return 'plank';
    if (text.includes('lunge') || text.includes('badminton') || text.includes('tennis')) return 'lunge';
    if (text.includes('deadlift') || text.includes('hinge')) return 'deadlift';
    
    return 'idle';
};

const SpecializedDashboard: React.FC<{ sportKey: string, planTitle: string }> = ({ sportKey, planTitle }) => {
    const { t } = useTranslation();
    const plan = useMemo(() => ALL_SPECIALIZED_PLANS.find(p => p.key === sportKey), [sportKey]);
    const [activeTab, setActiveTab] = useState<'tech' | 'physio'>('tech');
    const [animateStats, setAnimateStats] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => setAnimateStats(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!plan) return null;

    const isElite = planTitle.includes('Elite');
    const isNovice = planTitle.includes('Novice');
    const levelColor = isElite ? 'text-yellow-400' : isNovice ? 'text-emerald-400' : 'text-cyan-400';
    const levelLabel = isElite ? 'ELITE CLASS' : isNovice ? 'NOVICE ENTRY' : 'PRO LEAGUE';

    return (
        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 shadow-2xl bg-slate-900 group mb-6 animate-fade-in">
             {/* Background Image with Overlay */}
             <div className="absolute inset-0 z-0">
                 <img src={plan.imageUrl} alt={plan.sport} className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
             </div>

             <div className="relative z-10 p-8 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <div className={`px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${levelColor}`}>
                                 {levelLabel}
                             </div>
                             <div className="px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                 Protocol Active
                             </div>
                        </div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{plan.sport} <span className="text-slate-600">Dynamics</span></h2>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg backdrop-blur-sm">
                        <Trophy className={levelColor} size={24} />
                    </div>
                </div>

                {/* Interactive Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: 'PWR', val: plan.stats.pwr, color: 'bg-red-500' },
                        { label: 'AGI', val: plan.stats.agi, color: 'bg-yellow-500' },
                        { label: 'END', val: plan.stats.end, color: 'bg-cyan-500' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-3 flex flex-col justify-between h-24 relative overflow-hidden group/stat hover:border-white/20 transition-all">
                             <span className="text-[10px] font-black text-slate-500 tracking-widest z-10">{stat.label}</span>
                             <span className="text-2xl font-black text-white z-10">{stat.val}</span>
                             <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 z-10 overflow-hidden">
                                 <div 
                                    className={`h-full ${stat.color} transition-all duration-1000 ease-out`} 
                                    style={{ width: animateStats ? `${stat.val}%` : '0%' }}
                                 ></div>
                             </div>
                             {/* Ambient Glow */}
                             <div className={`absolute -bottom-4 -right-4 w-16 h-16 ${stat.color} opacity-10 blur-xl rounded-full group-hover/stat:opacity-20 transition-opacity`}></div>
                        </div>
                    ))}
                </div>

                {/* Tabs & Content */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-1.5">
                    <div className="flex p-1 bg-black/20 rounded-[2rem] mb-4">
                        <button 
                            onClick={() => setActiveTab('tech')}
                            className={`flex-1 py-3 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tech' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Tactical Analysis
                        </button>
                        <button 
                            onClick={() => setActiveTab('physio')}
                            className={`flex-1 py-3 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'physio' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Physio & Safety
                        </button>
                    </div>

                    <div className="px-4 pb-4 min-h-[140px]">
                        {activeTab === 'tech' ? (
                            <div className="space-y-3 animate-fade-in">
                                <div className="flex items-center gap-2 mb-2">
                                    <Crosshair size={14} className="text-cyan-400" />
                                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Focus: {plan.trainingFocus}</span>
                                </div>
                                <ul className="space-y-2">
                                    {plan.keyPoints.map((point, idx) => (
                                        <li key={idx} className="flex gap-3 text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-black flex-shrink-0">{idx + 1}</div>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                             <div className="space-y-3 animate-fade-in">
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors">
                                    <div className="flex items-center gap-2 mb-2 text-red-400">
                                        <ShieldAlert size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Risk Management</span>
                                    </div>
                                    <ul className="space-y-1">
                                        {plan.precautions.map((p, i) => (
                                            <li key={i} className="text-[10px] text-red-200/80 pl-3 border-l-2 border-red-500/30">{p}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                        <UtensilsCrossed size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Fuel Strategy</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-200/80">{plan.nutritionTips}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};

const NutritionDashboard: React.FC<{ 
    workoutPlan: WorkoutPlan, 
    nutritionPlan: NutritionPlan | null,
    onUpdated: (p: NutritionPlan) => void 
}> = ({ workoutPlan, nutritionPlan, onUpdated }) => {
    const { t } = useTranslation();
    const { userProfile, weightLog } = useContext(PlanContext);
    const [isLoading, setIsLoading] = useState(false);

    const handleSyncAndGenerate = async () => {
        if (!userProfile) return;
        setIsLoading(true);
        try {
            const latestWeightRecord = weightLog.length > 0 ? weightLog[0].weight : userProfile.weight;
            const { gender, age, height, goal } = userProfile;
            let bmr = gender === 'male' 
                ? (10 * latestWeightRecord) + (6.25 * height) - (5 * age) + 5
                : (10 * latestWeightRecord) + (6.25 * height) - (5 * age) - 161;
            
            const calculatedTdee = bmr * 1.55;
            const goalStr = t(`GOAL_${goal.toUpperCase() as any}`) || goal;
            
            const plan = await getAiNutritionPlan(goalStr, calculatedTdee, workoutPlan);
            onUpdated(plan);
        } catch (e) {
            console.error(e);
            alert("同步生成失敗，請確認網路與 API 設定。");
        } finally {
            setIsLoading(false);
        }
    };

    const currentWeightBase = weightLog.length > 0 ? weightLog[0].weight : userProfile?.weight;

    return (
        <div className="p-8 glass rounded-[3rem] border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-emerald-950/10 to-slate-950 relative overflow-hidden">
             <div className="absolute -right-12 -bottom-12 opacity-5 rotate-12 text-emerald-500"><UtensilsCrossed size={180} /></div>
             
             <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl shadow-lg shadow-emerald-500/20"><UtensilsCrossed size={18} /></div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Neural Nutrition</h3>
                        <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Dynamic Sync Active</p>
                    </div>
                </div>
                {nutritionPlan && (
                    <button onClick={handleSyncAndGenerate} className="p-2 rounded-xl bg-white/5 border border-white/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 transition-all">
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""}/>
                    </button>
                )}
             </div>

             {isLoading ? (
                 <div className="py-10 flex flex-col items-center gap-4 animate-pulse">
                     <Loader2 className="animate-spin text-emerald-500" size={32} />
                     <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Recalculating Macros...</p>
                 </div>
             ) : nutritionPlan ? (
                 <div className="space-y-6 relative z-10">
                     <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                             <Scale size={12} className="text-emerald-500/50" />
                             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Baseline: {currentWeightBase}kg</span>
                        </div>
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">AI Certified</span>
                     </div>

                     <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-[10px] text-slate-300 italic leading-relaxed">{nutritionPlan.summary}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                            <span className="text-[8px] font-black text-emerald-500/60 uppercase block mb-1">Workout Burn</span>
                            <span className="text-xl font-black text-white">{Math.round(nutritionPlan.estimatedWorkoutCalories)}<span className="text-[10px] ml-1">kcal</span></span>
                        </div>
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                            <span className="text-[8px] font-black text-emerald-500/60 uppercase block mb-1">Daily Target</span>
                            <span className="text-xl font-black text-white">{Math.round(nutritionPlan.dailyCalorieTarget)}<span className="text-[10px] ml-1">kcal</span></span>
                        </div>
                     </div>

                     <div className="space-y-2">
                        {nutritionPlan.meals.map((meal, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
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
                     <div className="p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 mb-4">
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-widest">
                            AI 將依據註冊資料與 <span className="text-cyan-500 font-black">Tracker 最新體重</span> 自動同步計算攝取量。
                        </p>
                     </div>
                     <button onClick={handleSyncAndGenerate} className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl uppercase text-[10px] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                         <Sparkles size={14} /> 同步生成 AI 飲食建議
                     </button>
                 </div>
             )}
        </div>
    );
};

export const MyPlanPage: React.FC<MyPlanPageProps> = ({ setPage }) => {
    const { activeWorkoutPlan, activeNutritionPlan, clearPlan, setActivePlan, userProfile, weightLog } = useContext(PlanContext);
    const { t } = useTranslation();

    const currentWeight = useMemo(() => {
        return weightLog.length > 0 ? weightLog[0].weight : (userProfile?.weight || 70);
    }, [weightLog, userProfile]);

    const activeDayAction = useMemo(() => {
        if (!activeWorkoutPlan || !activeWorkoutPlan.days.length) return 'idle';
        // 取得第一天的 focus
        const dayFocus = activeWorkoutPlan.days[0].focus;
        return getActionForDay(dayFocus, activeWorkoutPlan.sportKey);
    }, [activeWorkoutPlan]);

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
             
             {/* 專項運動專業儀表板 (如果有的話) */}
             {activeWorkoutPlan.sportKey && (
                <SpecializedDashboard sportKey={activeWorkoutPlan.sportKey} planTitle={activeWorkoutPlan.planTitle} />
             )}

             {/* 今日訓練置頂 (包含動畫預覽) */}
             <div className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Active Sequence</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 左側：詳細課表 */}
                    <div className="md:col-span-2">
                        <WorkoutPlanCard plan={activeWorkoutPlan} showAllDays={false} activeDayIndex={0} />
                    </div>

                    {/* 右側：Digital Twin Preview (手機版會在下方) */}
                    <div className="glass rounded-[2.5rem] border border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[250px] shadow-xl">
                        {/* 背景裝飾 */}
                        <div className="absolute inset-0 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none"></div>
                        <div className="absolute top-4 left-4 z-10">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Digital Twin Preview</span>
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{activeDayAction.toUpperCase()} MODE</span>
                        </div>
                        
                        {/* 小人動畫 */}
                        <div className="relative z-10 scale-90">
                            <BodyAvatar 
                                gender={userProfile?.gender || 'male'}
                                height={userProfile?.height || 175}
                                weight={currentWeight}
                                action={activeDayAction}
                                hideBackground={true}
                                className="w-40 h-56"
                            />
                        </div>

                        {/* 底部裝飾 */}
                        <div className="absolute bottom-4 w-full flex justify-center gap-2 opacity-50">
                             <div className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce delay-0"></div>
                             <div className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce delay-100"></div>
                             <div className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce delay-200"></div>
                        </div>
                    </div>
                </div>
             </div>

             {/* 全域飲食儀表板整合 */}
             <NutritionDashboard 
                workoutPlan={activeWorkoutPlan} 
                nutritionPlan={activeNutritionPlan}
                onUpdated={(p) => setActivePlan(activeWorkoutPlan, p)}
             />
        </div>
    );
};
