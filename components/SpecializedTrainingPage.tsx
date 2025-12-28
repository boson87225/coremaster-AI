
import React, { useState, useContext, useMemo } from 'react';
import { Zap, Swords, ArrowLeft, Bot, CheckCircle, BrainCircuit, Loader2, Sparkles, Crosshair, ShieldCheck, List, Target, Flame, Activity, Wind, Trophy, ChevronDown } from './icons';
import { ALL_SPECIALIZED_PLANS } from '../constants';
import type { SpecializedPlan, WeeklyWorkout, WorkoutPlan, WorkoutExercise, TrainingLevel } from '../types';
import { CompetitionPrepCoach } from './CompetitionPrepCoach';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';

const StatBar: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-slate-500">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

export const SpecializedTrainingPage: React.FC = () => {
    const { setActiveWorkoutPlan } = useContext(PlanContext);
    const { t } = useTranslation();
    
    // UI 選擇狀態
    const [selectedSport, setSelectedSport] = useState<string>("格鬥");
    const [selectedLevel, setSelectedLevel] = useState<TrainingLevel>("Pro");
    const [status, setStatus] = useState<'idle' | 'linking' | 'success'>('idle');
    const [showPrepCoach, setShowPrepCoach] = useState(false);

    // 獲取獨特運動清單 (12種)
    const sports = useMemo(() => Array.from(new Set(ALL_SPECIALIZED_PLANS.map(p => p.sport))), []);
    
    // 根據運動與等級過濾計畫
    const currentPlan = useMemo(() => 
        ALL_SPECIALIZED_PLANS.find(p => p.sport === selectedSport && p.level === selectedLevel) || 
        ALL_SPECIALIZED_PLANS.find(p => p.sport === selectedSport) || 
        ALL_SPECIALIZED_PLANS[0]
    , [selectedSport, selectedLevel]);

    const handleSetPlan = () => {
        setStatus('linking');
        setTimeout(() => {
            const workoutDays = currentPlan.schedule.map((day, index) => ({
                day: index + 1,
                title: day.focus,
                focus: `${currentPlan.sport} (${currentPlan.level})`,
                exercises: day.exercises.map(ex => {
                    const parts = ex.details.split('x');
                    return {
                        name: ex.name,
                        sets: parts[0]?.trim() || '3',
                        reps: parts[1]?.trim() || '12',
                        rest: '60s',
                        notes: `專項循環: ${currentPlan.sport}`,
                    };
                }),
            }));

            const workoutPlan: WorkoutPlan = {
                planTitle: `${currentPlan.sport} ${currentPlan.level} 循環方案`,
                planSummary: currentPlan.description,
                days: workoutDays,
                sportKey: currentPlan.key
            };

            setActiveWorkoutPlan(workoutPlan);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        }, 1200);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* 1. 下拉選單選擇運動 */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Sport Unit Category</label>
                <div className="relative">
                    <select 
                        value={selectedSport}
                        onChange={(e) => setSelectedSport(e.target.value)}
                        className="w-full bg-slate-800/80 border border-white/10 p-5 rounded-[1.5rem] text-sm font-black text-white uppercase tracking-widest outline-none appearance-none focus:border-cyan-500 transition-all pr-12"
                    >
                        {sports.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                        <ChevronDown size={20} />
                    </div>
                </div>
            </div>

            {/* 2. 等級選擇 */}
            <div className="bg-slate-900/60 p-1.5 rounded-[2rem] border border-white/5 flex gap-1">
                {(['Novice', 'Pro', 'Elite'] as TrainingLevel[]).map(lv => (
                    <button
                        key={lv}
                        onClick={() => setSelectedLevel(lv)}
                        className={`flex-1 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                            selectedLevel === lv 
                            ? 'bg-cyan-500 text-slate-950 shadow-inner' 
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                    >
                        {lv}
                    </button>
                ))}
            </div>

            {/* 3. 計畫預覽 */}
            <div className="relative h-64 rounded-[3rem] overflow-hidden border border-white/10 group shadow-2xl">
                <img src={currentPlan.imageUrl} alt={currentPlan.sport} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-cyan-500 text-slate-950 text-[8px] font-black uppercase rounded-full">{currentPlan.level}</span>
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Protocol Active</span>
                    </div>
                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{currentPlan.sport} 強化</h3>
                    <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 italic font-medium leading-relaxed">{currentPlan.description}</p>
                </div>
            </div>

            {/* 4. 能力指標 */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-900/40 rounded-[2.5rem] border border-white/10 space-y-4 shadow-xl">
                    <StatBar label="Power" value={currentPlan.stats.pwr} color="bg-red-500" />
                    <StatBar label="Agility" value={currentPlan.stats.agi} color="bg-yellow-500" />
                    <StatBar label="Endurance" value={currentPlan.stats.end} color="bg-cyan-500" />
                </div>
                <div className="p-6 bg-slate-900/40 rounded-[2.5rem] border border-white/10 flex flex-col justify-center gap-3">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-cyan-400" />
                        <span className="text-[9px] font-black text-white uppercase">天數: {currentPlan.schedule.length}日循環</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-yellow-400" />
                        <span className="text-[9px] font-black text-white uppercase">強度: {currentPlan.level === 'Elite' ? '極限' : currentPlan.level === 'Pro' ? '高' : '中'}</span>
                    </div>
                </div>
            </div>

            {/* 5. 完整動作預覽 (渲染所有 Day) */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4">完整訓練序列</h4>
                {currentPlan.schedule.map((day, idx) => (
                    <div key={idx} className="glass rounded-[2.5rem] border border-white/5 overflow-hidden transition-all hover:border-cyan-500/30 shadow-lg">
                        <div className="px-6 py-4 bg-white/5 flex justify-between items-center border-b border-white/5">
                            <span className="text-xs font-black text-white uppercase italic tracking-widest">{day.day}: {day.focus}</span>
                            <Trophy size={14} className="text-cyan-500/50" />
                        </div>
                        <div className="p-6 grid gap-4">
                            {day.exercises.map((ex, eIdx) => (
                                <div key={eIdx} className="flex justify-between items-center group text-[11px]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-cyan-500 transition-colors"></div>
                                        <span className="font-medium text-slate-300 group-hover:text-white">{ex.name}</span>
                                    </div>
                                    <span className="font-mono font-black text-slate-500">{ex.details}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* 6. 啟動按鈕 */}
            <button
                onClick={handleSetPlan}
                disabled={status !== 'idle'}
                className={`w-full py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl ${
                    status === 'success' ? 'bg-emerald-500 text-slate-950' : 'bg-white text-slate-950 hover:bg-cyan-400 active:scale-95'
                }`}
            >
                {status === 'linking' ? (
                    <span className="flex items-center justify-center gap-3">
                        <Loader2 size={20} className="animate-spin" /> SYNCHRONIZING...
                    </span>
                ) : status === 'success' ? (
                    <span className="flex items-center justify-center gap-3">
                        <CheckCircle size={20} /> PROTOCOL LOADED
                    </span>
                ) : (
                    `採納 ${currentPlan.sport} 3日計畫`
                )}
            </button>

            {selectedSport === '格鬥' && (
                <button onClick={() => setShowPrepCoach(true)} className="w-full py-4 bg-red-600/10 border border-red-500/20 rounded-[2rem] text-[9px] font-black text-red-400 uppercase tracking-[0.3em] hover:bg-red-600/20 transition-all">
                    開啟競技備賽 AI 助理
                </button>
            )}
            
            {showPrepCoach && <CompetitionPrepCoach onClose={() => setShowPrepCoach(false)} />}
        </div>
    );
};
