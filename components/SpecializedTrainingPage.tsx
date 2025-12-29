
import React, { useState, useContext, useMemo } from 'react';
import { Zap, Swords, ArrowLeft, Bot, CheckCircle, BrainCircuit, Loader2, Sparkles, Crosshair, ShieldCheck, List, Target, Flame, Activity, Wind, Trophy, ChevronDown, Info, ShieldAlert } from './icons';
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

// --- 動態難度調節字典 ---
// 定義動作的「退階 (Novice)」與「進階 (Elite)」變體
const EXERCISE_MODIFIERS: Record<string, { novice?: string, elite?: string }> = {
    "波比跳": { novice: "慢速波比 (不跳)", elite: "單腳波比跳" },
    "深度跳": { novice: "深蹲跳", elite: "負重背心深度跳" },
    "單腳助跑起跳": { novice: "原地垂直起跳", elite: "負重單腳起跳" },
    "槓鈴深蹲": { novice: "高腳杯深蹲", elite: "暫停式槓鈴深蹲" },
    "硬舉": { novice: "壺鈴硬舉", elite: "赤字硬舉 (Deficit)" },
    "引體向上": { novice: "彈力帶輔助引體", elite: "負重引體向上" },
    "懸垂舉腿": { novice: "地面抬腿", elite: "嚴格腳趾觸槓 (Toes-to-Bar)" },
    "箱跳": { novice: "登階運動", elite: "連續高箱跳" },
    "跳繩": { novice: "無繩跳繩", elite: "雙迴旋跳繩 (Double Unders)" },
    "六角槓硬舉": { novice: "啞鈴硬舉", elite: "大重量六角槓硬舉" },
    "農夫走路": { novice: "雙手啞鈴行走", elite: "單臂大重量行走" },
    "土耳其起立": { novice: "分段式起立練習", elite: "大重量土耳其起立" },
    "臥推": { novice: "伏地挺身", elite: "槓鈴臥推 (加鏈條/彈力帶)" },
    "藥球砸牆": { novice: "輕藥球胸推", elite: "旋轉爆發砸牆" },
    "戰繩衝刺": { novice: "戰繩雙手波浪", elite: "戰繩單手交替衝刺" },
    "保加利亞蹲": { novice: "分腿蹲", elite: "負重保加利亞蹲" },
    "北歐捲腿": { novice: "抗力球勾腿", elite: "負重北歐捲腿" },
    "單腳RDL": { novice: "輔助單腳硬舉", elite: "雙壺鈴單腳硬舉" },
    "帕洛夫推舉": { novice: "標準棒式", elite: "動態帕洛夫推舉" },
    "划船機衝刺": { novice: "中速划船", elite: "全力衝刺划船" },
    "倒立撐": { novice: "高腳倒立撐", elite: "缺口倒立撐" },
    "抓舉技術": { novice: "PVC管動作練習", elite: "完整抓舉" },
};

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
    
    // --- 核心邏輯：動態生成分級計畫 ---
    const currentPlan = useMemo(() => {
        // 1. 找到該運動的基礎計畫 (預設通常是 Pro)
        const basePlan = ALL_SPECIALIZED_PLANS.find(p => p.sport === selectedSport) || ALL_SPECIALIZED_PLANS[0];
        
        // 2. 深拷貝以避免修改原始常數
        const plan: SpecializedPlan = JSON.parse(JSON.stringify(basePlan));
        plan.level = selectedLevel;

        // 3. 根據等級調整數值與內容
        if (selectedLevel === 'Novice') {
            // 新手調整
            plan.stats.pwr = Math.max(20, plan.stats.pwr - 20);
            plan.stats.agi = Math.max(20, plan.stats.agi - 10);
            plan.stats.end = Math.max(20, plan.stats.end - 10);
            plan.description = `(入門級調整) ${plan.description}`;
            
            plan.schedule.forEach(day => {
                day.exercises.forEach(ex => {
                    // 替換為較簡單動作
                    if (EXERCISE_MODIFIERS[ex.name]?.novice) {
                        ex.name = EXERCISE_MODIFIERS[ex.name].novice!;
                    }
                    // 降低組數與調整次數
                    let details = ex.details;
                    details = details.replace(/5x/g, '3x').replace(/4x/g, '3x').replace(/3x/g, '2x');
                    details = details.replace(/MAX/g, '力竭前1下'); // 安全考量
                    ex.details = details;
                });
            });
            plan.precautions.unshift("動作質量優先於重量，如有不適請降階動作。");

        } else if (selectedLevel === 'Elite') {
            // 菁英調整
            plan.stats.pwr = Math.min(100, plan.stats.pwr + 5);
            plan.stats.agi = Math.min(100, plan.stats.agi + 5);
            plan.stats.end = Math.min(100, plan.stats.end + 5);
            plan.description = `(職業菁英版) ${plan.description}`;

            plan.schedule.forEach(day => {
                day.exercises.forEach(ex => {
                    // 替換為進階動作
                    if (EXERCISE_MODIFIERS[ex.name]?.elite) {
                        ex.name = EXERCISE_MODIFIERS[ex.name].elite!;
                    }
                    // 增加組數
                    let details = ex.details;
                    details = details.replace(/3x/g, '4x').replace(/4x/g, '5x').replace(/5x/g, '6x');
                    ex.details = details;
                });
            });
            plan.precautions.unshift("此強度極高，請確保有防護員或教練在旁。");
        }
        // Pro 保持原樣 (除了 level 標籤)

        return plan;
    }, [selectedSport, selectedLevel]);

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
                        rest: selectedLevel === 'Elite' ? '45s' : selectedLevel === 'Novice' ? '90s' : '60s',
                        notes: `專項要點: ${currentPlan.keyPoints[0]}`,
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
                        <span className={`px-3 py-1 text-slate-950 text-[8px] font-black uppercase rounded-full ${selectedLevel === 'Elite' ? 'bg-yellow-400' : selectedLevel === 'Novice' ? 'bg-emerald-400' : 'bg-cyan-500'}`}>
                            {currentPlan.level} Protocol
                        </span>
                    </div>
                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{currentPlan.sport} 強化</h3>
                    <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 italic font-medium leading-relaxed">{currentPlan.description}</p>
                </div>
            </div>

            {/* 4. 訓練指南 (新看板) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Info size={14} className="text-cyan-400" />
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Training Guide</h4>
                </div>
                <div className="grid gap-3">
                    <div className="p-5 glass rounded-[2rem] border border-cyan-500/10 space-y-3">
                        <div className="flex items-center gap-3">
                            <Target size={18} className="text-cyan-400" />
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">焦點: {currentPlan.trainingFocus}</span>
                        </div>
                        <div className="space-y-2">
                            {currentPlan.keyPoints.map((pt, i) => (
                                <div key={i} className="flex gap-2 text-[10px] text-slate-300">
                                    <span className="text-cyan-500 font-black">•</span>
                                    <p>{pt}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-5 glass rounded-[2rem] border border-red-500/10 space-y-3 bg-red-500/5">
                        <div className="flex items-center gap-3">
                            <ShieldAlert size={18} className="text-red-400" />
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">注意事項</span>
                        </div>
                        <div className="space-y-2">
                            {currentPlan.precautions.map((pre, i) => (
                                <div key={i} className="flex gap-2 text-[10px] text-red-300/80">
                                    <span className="text-red-500 font-black">!</span>
                                    <p>{pre}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. 能力指標 */}
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
                        <span className="text-[9px] font-black text-white uppercase">強度: {selectedLevel === 'Elite' ? '極限 (Max)' : selectedLevel === 'Pro' ? '高 (High)' : '適中 (Mod)'}</span>
                    </div>
                </div>
            </div>

            {/* 6. 完整動作預覽 (顯示已修正的動作名稱) */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4">訓練序列清單 ({selectedLevel})</h4>
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
                                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${selectedLevel === 'Novice' ? 'bg-emerald-500' : 'bg-cyan-500'}`}></div>
                                        <span className={`font-medium group-hover:text-white ${selectedLevel === 'Elite' ? 'text-yellow-100' : 'text-slate-300'}`}>{ex.name}</span>
                                    </div>
                                    <span className="font-mono font-black text-slate-500">{ex.details}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* 7. 啟動按鈕 */}
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
                    `採納 ${currentPlan.sport} (${selectedLevel}) 計畫`
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
