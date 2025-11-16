
import React, { useState, useContext } from 'react';
import { Zap, Swords, Target, Feather, ArrowLeft, Bot, CheckCircle } from './icons';
import { COMBAT_SPORTS_PLAN, BASKETBALL_PLAN, BADMINTON_PLAN } from '../constants';
import type { SpecializedPlan, WeeklyWorkout, WorkoutPlan, WorkoutExercise } from '../types';
import { CompetitionPrepCoach } from './CompetitionPrepCoach';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';


const plans = [
    { plan: COMBAT_SPORTS_PLAN, icon: <Swords className="w-10 h-10 text-red-400" /> },
    { plan: BASKETBALL_PLAN, icon: <Target className="w-10 h-10 text-orange-400" /> },
    { plan: BADMINTON_PLAN, icon: <Feather className="w-10 h-10 text-sky-400" /> },
];

const EnergySystemInfo: React.FC = () => {
    const { t } = useTranslation();
    const systems = [
        { name: t('ENERGY_SYSTEM_ATP_NAME'), duration: t('ENERGY_SYSTEM_ATP_DURATION'), example: t('ENERGY_SYSTEM_ATP_EXAMPLE'), color: "bg-red-900/50 text-red-300", icon: "💥" },
        { name: t('ENERGY_SYSTEM_GLYCO_NAME'), duration: t('ENERGY_SYSTEM_GLYCO_DURATION'), example: t('ENERGY_SYSTEM_GLYCO_EXAMPLE'), color: "bg-yellow-900/50 text-yellow-300", icon: "🚀" },
        { name: t('ENERGY_SYSTEM_OXI_NAME'), duration: t('ENERGY_SYSTEM_OXI_DURATION'), example: t('ENERGY_SYSTEM_OXI_EXAMPLE'), color: "bg-green-900/50 text-green-300", icon: "🔋" },
    ];
    return (
        <details className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 text-sm text-slate-300 open:pb-4 transition">
            <summary className="font-bold cursor-pointer text-base">{t('ENERGY_SYSTEM_TITLE')}</summary>
            <div className="mt-4 space-y-4 animate-fade-in">
                <p className="text-slate-400">
                    {t('ENERGY_SYSTEM_DESC')}
                </p>
                {systems.map((s, index) => (
                    <div key={index} className={`p-3 rounded-lg ${s.color}`}>
                        <p className="font-extrabold flex items-center mb-1"><span className="mr-2 text-lg">{s.icon}</span> {s.name}</p>
                        <ul className="list-disc list-inside text-xs space-y-1 ml-4">
                            <li><span className="font-semibold">{t('ENERGY_SYSTEM_DURATION_LABEL')}</span> {s.duration}</li>
                            <li><span className="font-semibold">{t('ENERGY_SYSTEM_EXAMPLE_LABEL')}</span> {s.example}</li>
                        </ul>
                    </div>
                ))}
            </div>
        </details>
    );
};

const PlanViewer: React.FC<{ plan: SpecializedPlan; onBack: () => void }> = ({ plan, onBack }) => {
    const [showPrepCoach, setShowPrepCoach] = useState(false);
    const { setActiveWorkoutPlan } = useContext(PlanContext);
    const [isPlanSet, setIsPlanSet] = useState(false);
    const { t } = useTranslation();

    const convertToWorkoutPlan = (specializedPlan: SpecializedPlan): WorkoutPlan => {
        const workoutDays = specializedPlan.schedule.map((day, index) => {
            const exercises: WorkoutExercise[] = day.exercises.map(ex => {
                const parts = ex.details.split('x');
                const sets = parts[0]?.trim() || 'N/A';
                const reps = parts[1]?.trim() || 'N/A';
                return {
                    name: ex.name,
                    sets: sets,
                    reps: reps,
                    rest: '60s',
                    notes: t('SPECIALIZED_PLAN_NOTE', { sport: specializedPlan.sport }),
                };
            });
            return {
                day: index + 1,
                title: day.focus,
                focus: specializedPlan.sport,
                exercises: exercises,
            };
        });

        return {
            planTitle: t('SPECIALIZED_PLAN_TITLE', { sport: specializedPlan.sport }),
            planSummary: specializedPlan.description,
            days: workoutDays,
        };
    };
    
    const handleSetPlan = () => {
        const workoutPlan = convertToWorkoutPlan(plan);
        setActiveWorkoutPlan(workoutPlan);
        setIsPlanSet(true);
        setTimeout(() => setIsPlanSet(false), 2000); // Reset button state after 2 seconds
    };

    return (
        <div className="animate-fade-in space-y-4">
            <button onClick={onBack} className="flex items-center gap-2 text-cyan-400 font-semibold hover:underline">
                <ArrowLeft size={18} /> {t('BACK_TO_SELECTION')}
            </button>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <h3 className="text-2xl font-bold text-cyan-300">{t('SPECIALIZED_PLAN_TITLE', { sport: plan.sport })}</h3>
                <p className="mt-2 text-slate-400 max-w-prose mx-auto">{plan.description}</p>
            </div>
             <button
                onClick={handleSetPlan}
                disabled={isPlanSet}
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 border rounded-full shadow-lg text-lg font-bold text-white transition-colors duration-300 ${
                    isPlanSet 
                    ? 'bg-green-700 border-green-600 cursor-not-allowed' 
                    : 'bg-cyan-600 hover:bg-cyan-700 border-transparent'
                }`}
            >
                <CheckCircle className="w-6 h-6" />
                {isPlanSet ? t('PLAN_SET_SUCCESS') : t('ADOPT_THIS_PLAN')}
            </button>
            <div className="space-y-4">
                {plan.schedule.map((day: WeeklyWorkout, index: number) => (
                    <div key={index} className="bg-slate-800 border border-slate-700 shadow-sm rounded-xl overflow-hidden">
                        <div className="p-3 bg-slate-700/50 border-b border-slate-700">
                            <h4 className="text-lg font-bold text-slate-200">{day.day}: {day.focus}</h4>
                        </div>
                        <ul className="divide-y divide-slate-700 p-3">
                            {day.exercises.map((ex, index) => (
                                <li key={index} className="py-2 flex justify-between items-center">
                                    <span className="font-medium text-slate-300">{ex.name}</span>
                                    <span className="text-sm font-semibold text-slate-300 bg-slate-600 px-2 py-1 rounded-full">{ex.details}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {plan.key === 'combat' && !showPrepCoach && (
                <button
                    onClick={() => setShowPrepCoach(true)}
                    className="w-full flex justify-center items-center gap-2 mt-4 py-3 px-4 border border-transparent rounded-full shadow-lg text-md font-bold text-white bg-red-600 hover:bg-red-700 transition"
                >
                    <Bot className="w-5 h-5" />
                    {t('OPEN_COMPETITION_PREP_AI')}
                </button>
            )}
            {showPrepCoach && <CompetitionPrepCoach onClose={() => setShowPrepCoach(false)} />}
        </div>
    );
};

export const SpecializedTrainingPage: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<SpecializedPlan | null>(null);
    const { t } = useTranslation();

    return (
        <section className="p-4 md:p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl max-w-lg mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-slate-700 pb-3 flex items-center">
                <Zap className="w-6 h-6 mr-2" /> {t('SPECIALIZED_TRAINING_TITLE')}
            </h2>

            {selectedPlan ? (
                <PlanViewer plan={selectedPlan} onBack={() => setSelectedPlan(null)} />
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <p className="text-slate-400">
                        {t('SPECIALIZED_TRAINING_DESC')}
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                        {plans.map(({ plan, icon }) => (
                            <button key={plan.key} onClick={() => setSelectedPlan(plan)} className="text-left p-4 border border-slate-700 rounded-xl hover:shadow-lg hover:border-cyan-400 transition-all duration-300 transform hover:-translate-y-1 bg-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0">{icon}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-200">{plan.sport}</h3>
                                        <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {plan.primarySystems.map(system => (
                                                <span key={system} className="text-xs font-semibold bg-cyan-400/20 text-cyan-200 px-2 py-0.5 rounded-full">{system}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <EnergySystemInfo />
                </div>
            )}
        </section>
    );
};