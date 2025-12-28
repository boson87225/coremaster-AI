import React, { useState, useContext } from 'react';
import { Zap, Swords, Target, Feather, ArrowLeft, Bot, CheckCircle, Activity, Circle, Trophy, FlagTriangleRight, Baseball, Ghost, Footprints } from './icons';
import { COMBAT_SPORTS_PLAN, BASKETBALL_PLAN, BADMINTON_PLAN, VOLLEYBALL_PLAN, TENNIS_PLAN, SWIMMING_DRYLAND_PLAN, GOLF_PLAN, BASEBALL_PLAN, SOCCER_PLAN, TABLE_TENNIS_PLAN } from '../constants';
import type { SpecializedPlan, WeeklyWorkout, WorkoutPlan, WorkoutExercise } from '../types';
import { CompetitionPrepCoach } from './CompetitionPrepCoach';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';

const plans = [
    { plan: COMBAT_SPORTS_PLAN, icon: <Swords className="w-10 h-10 text-red-400" /> },
    { plan: BASKETBALL_PLAN, icon: <Target className="w-10 h-10 text-orange-400" /> },
    { plan: BADMINTON_PLAN, icon: <Feather className="w-10 h-10 text-sky-400" /> },
    { plan: VOLLEYBALL_PLAN, icon: <Activity className="w-10 h-10 text-yellow-400" /> },
    { plan: TENNIS_PLAN, icon: <Trophy className="w-10 h-10 text-emerald-400" /> },
    { plan: SWIMMING_DRYLAND_PLAN, icon: <Circle className="w-10 h-10 text-blue-400" /> },
    { plan: GOLF_PLAN, icon: <FlagTriangleRight className="w-10 h-10 text-lime-400" /> },
    { plan: BASEBALL_PLAN, icon: <Baseball className="w-10 h-10 text-white" /> },
    { plan: SOCCER_PLAN, icon: <Footprints className="w-10 h-10 text-indigo-400" /> },
    { plan: TABLE_TENNIS_PLAN, icon: <Ghost className="w-10 h-10 text-pink-400" /> },
];

const PlanViewer: React.FC<{ plan: SpecializedPlan; onBack: () => void }> = ({ plan, onBack }) => {
    const { setActiveWorkoutPlan } = useContext(PlanContext);
    const { t } = useTranslation();
    const [isPlanSet, setIsPlanSet] = useState(false);

    const handleSetPlan = () => {
        const workoutPlan: WorkoutPlan = {
            planTitle: plan.sport + " 專項強化計畫",
            planSummary: plan.description,
            days: plan.schedule.map((d, i) => ({
                day: i + 1,
                title: d.focus,
                focus: plan.sport,
                exercises: d.exercises.map(ex => ({
                    name: ex.name,
                    sets: ex.details.split('x')[0] || '3',
                    reps: ex.details.split('x')[1] || '10',
                    rest: '60s'
                }))
            }))
        };
        setActiveWorkoutPlan(workoutPlan);
        setIsPlanSet(true);
        setTimeout(() => setIsPlanSet(false), 2000);
    };

    return (
        <div className="animate-fade-in space-y-4">
            <button onClick={onBack} className="flex items-center gap-2 text-cyan-400 font-semibold hover:underline">
                <ArrowLeft size={18} /> 返回選擇
            </button>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <h3 className="text-2xl font-bold text-cyan-300">{plan.sport} 專項訓練</h3>
                <p className="mt-2 text-slate-400">{plan.description}</p>
            </div>
            <button onClick={handleSetPlan} disabled={isPlanSet} className={`w-full py-3 rounded-full font-bold text-white transition ${isPlanSet ? 'bg-green-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
                {isPlanSet ? "已採納計畫" : "採納此運科計畫"}
            </button>
            <div className="space-y-4">
                {plan.schedule.map((day, idx) => (
                    <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-3 bg-slate-700/50 border-b border-slate-700 font-bold text-slate-200">
                            {day.day}: {day.focus}
                        </div>
                        <ul className="p-3 divide-y divide-slate-700">
                            {day.exercises.map((ex, i) => (
                                <li key={i} className="py-2 flex justify-between">
                                    <span className="text-slate-300">{ex.name}</span>
                                    <span className="text-cyan-400 font-mono text-sm">{ex.details}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const SpecializedTrainingPage: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<SpecializedPlan | null>(null);

    return (
        <section className="p-4 md:p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl max-w-lg mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-slate-700 pb-3 flex items-center">
                <Zap className="w-6 h-6 mr-2" /> 運科專項訓練系統
            </h2>
            {selectedPlan ? (
                <PlanViewer plan={selectedPlan} onBack={() => setSelectedPlan(null)} />
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {plans.map(({ plan, icon }) => (
                        <button key={plan.key} onClick={() => setSelectedPlan(plan)} className="text-left p-4 border border-slate-700 rounded-xl hover:border-cyan-400 bg-slate-800 flex items-center gap-4 transition transform hover:-translate-y-1">
                            <div className="flex-shrink-0">{icon}</div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-200">{plan.sport}</h3>
                                <div className="flex gap-2 mt-1">
                                    {plan.primarySystems.map(s => (
                                        <span key={s} className="text-[9px] bg-cyan-900/50 text-cyan-300 px-1.5 py-0.5 rounded-full">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
};