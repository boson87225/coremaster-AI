
import React, { useState, useContext } from 'react';
import { ClipboardList, Loader2, Sparkles, Play, UtensilsCrossed, X, CheckCircle } from './icons';
import { getAiWorkoutPlan, getAiNutritionPlan } from '../services/geminiService';
import type { WorkoutPlan, WorkoutDay, WorkoutExercise, NutritionPlan, Meal, Page, UserProfile } from '../types';
import { WorkoutContext } from '../context/WorkoutContext';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import { TdeeCalculator } from './TdeeCalculator';

interface AiPlannerPageProps {
    setPage: (page: Page) => void;
}

const PlanDisplay: React.FC<{ 
    plan: WorkoutPlan;
    nutritionPlan: NutritionPlan | null;
    onSetPlan: () => void;
}> = ({ plan, nutritionPlan, onSetPlan }) => {
    const { startWorkout } = useContext(WorkoutContext);
    const { t } = useTranslation();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                <h3 className="text-2xl font-bold text-cyan-300">{plan.planTitle}</h3>
                <p className="mt-2 text-slate-400 max-w-prose mx-auto">{plan.planSummary}</p>
            </div>

            <button
                onClick={onSetPlan}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-green-600 hover:bg-green-700 transition transform hover:scale-[1.02]"
            >
                <CheckCircle className="w-6 h-6" />
                {t('SET_AS_MY_PLAN')}
            </button>

            <div className="space-y-4">
                {plan.days.map((day: WorkoutDay, dayIndex: number) => (
                    <div key={day.day} className="bg-slate-800 border border-slate-700 shadow-md rounded-xl overflow-hidden">
                        <div className="p-4 bg-slate-700/50 border-b border-slate-700 flex justify-between items-center">
                            <div>
                                <h4 className="text-xl font-bold text-cyan-300">{t('DAY_TITLE', { day: day.day, title: day.title })}</h4>
                                <p className="text-sm font-medium text-cyan-400">{day.focus}</p>
                            </div>
                             <button 
                                onClick={() => startWorkout(plan, dayIndex)}
                                className="flex items-center gap-2 py-2 px-4 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-700 transition transform hover:scale-105"
                                title={t('START_DAY_WORKOUT_TITLE', { day: day.day })}
                            >
                                <Play size={18} />
                                <span className="font-semibold text-sm">{t('START_WORKOUT_BUTTON')}</span>
                            </button>
                        </div>
                        <div className="p-4">
                            <ul className="space-y-3">
                                {day.exercises.map((ex: WorkoutExercise, index: number) => (
                                    <li key={index} className="p-3 bg-slate-700/50 rounded-lg">
                                        <p className="font-semibold text-slate-200">{ex.name}</p>
                                        <div className="flex justify-between items-center mt-1 text-sm text-slate-400">
                                            <span><strong className="text-slate-200">{t('SETS')}:</strong> {ex.sets}</span>
                                            <span><strong className="text-slate-200">{t('REPS')}:</strong> {ex.reps}</span>
                                            <span><strong className="text-slate-200">{t('REST')}:</strong> {ex.rest}</span>
                                        </div>
                                        {ex.notes && <p className="mt-2 text-xs text-yellow-300 bg-yellow-500/10 p-2 rounded">💡 {ex.notes}</p>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
             {nutritionPlan && <NutritionPlanDisplay plan={nutritionPlan} />}
        </div>
    );
}

const NutritionTdeeModal: React.FC<{
    onGenerate: (tdee: number) => void;
    onClose: () => void;
}> = ({ onGenerate, onClose }) => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-200">{t('GENERATE_NUTRITION_PLAN')}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700"><X size={20} /></button>
                </div>
                <p className="text-sm text-slate-400">
                    {t('ENTER_TDEE_DESC')}
                </p>
                <TdeeCalculator onTdeeCalculated={onGenerate} />
            </div>
        </div>
    );
};

const NutritionPlanDisplay: React.FC<{ plan: NutritionPlan }> = ({ plan }) => {
    const { t } = useTranslation();
    return (
    <div className="mt-6 space-y-4 p-4 bg-green-900/20 border border-green-500/20 rounded-xl animate-fade-in">
        <h3 className="text-xl font-bold text-green-300 text-center">{t('NUTRITION_PLAN_TITLE')}</h3>
        <p className="text-sm text-center text-slate-300 bg-slate-700/50 p-3 rounded-lg">{plan.summary}</p>
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-slate-700/50 rounded-lg shadow-sm">
                <p className="text-xs font-semibold text-slate-400">{t('ESTIMATED_WORKOUT_CALORIES')}</p>
                <p className="text-2xl font-bold text-orange-400">~{Math.round(plan.estimatedWorkoutCalories)}</p>
                <p className="text-xs text-slate-400">{t('CALORIES_UNIT')}</p>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg shadow-sm">
                <p className="text-xs font-semibold text-slate-400">{t('DAILY_CALORIE_TARGET')}</p>
                <p className="text-2xl font-bold text-green-400">{Math.round(plan.dailyCalorieTarget)}</p>
                 <p className="text-xs text-slate-400">{t('CALORIES_UNIT')}</p>
            </div>
        </div>
        <div className="space-y-3">
            {plan.meals.map((meal: Meal) => (
                <div key={meal.name} className="p-4 bg-slate-700/50 rounded-lg shadow-sm">
                    <h4 className="font-bold text-green-300">{t(meal.name.toUpperCase() as any)} (~{Math.round(meal.calories)} {t('CALORIES_UNIT')})</h4>
                    <p className="text-sm text-slate-300 mt-1">{meal.description}</p>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-center">
                        <p className="bg-blue-500/20 text-blue-300 p-1 rounded">{t('PROTEIN')}: {Math.round(meal.protein)}g</p>
                        <p className="bg-yellow-500/20 text-yellow-300 p-1 rounded">{t('CARBS')}: {Math.round(meal.carbs)}g</p>
                        <p className="bg-purple-500/20 text-purple-300 p-1 rounded">{t('FAT')}: {Math.round(meal.fat)}g</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
    );
};


export const AiPlannerPage: React.FC<AiPlannerPageProps> = ({ setPage }) => {
    const [goal, setGoal] = useState<UserProfile['goal']>('MUSCLE_GAIN');
    const [days, setDays] = useState(4);
    const [experience, setExperience] = useState('中階');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [plan, setPlan] = useState<WorkoutPlan | null>(null);
    const { t } = useTranslation();

    const { setActivePlan } = useContext(PlanContext);

    // New state for nutrition
    const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
    const [isNutritionLoading, setIsNutritionLoading] = useState(false);
    const [nutritionError, setNutritionError] = useState<string | null>(null);
    const [showTdeeModal, setShowTdeeModal] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setPlan(null);
        setNutritionPlan(null); // Reset nutrition plan when creating a new workout plan

        try {
            const translatedGoal = t(`GOAL_${goal.toUpperCase()}`);
            const translatedExperience = t(`EXP_${experience.toUpperCase()}`);
            const generatedPlan = await getAiWorkoutPlan(translatedGoal, days, translatedExperience);
            setPlan(generatedPlan);
        } catch (err: any) {
            setError(err.message || t('UNKNOWN_ERROR'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateNutrition = async (tdee: number) => {
        if (!plan || !tdee) return;
        setShowTdeeModal(false);
        setIsNutritionLoading(true);
        setNutritionError(null);
        setNutritionPlan(null);

        try {
            const translatedGoal = t(`GOAL_${goal.toUpperCase()}`);
            const generatedNutritionPlan = await getAiNutritionPlan(translatedGoal, tdee, plan);
            setNutritionPlan(generatedNutritionPlan);
        } catch (err: any) {
            setNutritionError(err.message || t('NUTRITION_PLAN_ERROR'));
        } finally {
            setIsNutritionLoading(false);
        }
    };

    const handleSetPlan = () => {
        if (plan) {
            setActivePlan(plan, nutritionPlan);
            setPage('my_plan');
        }
    };

    const resetForm = () => {
        setPlan(null);
        setError(null);
        setNutritionPlan(null);
        setNutritionError(null);
    }

    return (
        <section className="p-4 md:p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl max-w-lg mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-slate-700 pb-3 flex items-center">
                <ClipboardList className="w-6 h-6 mr-2" /> {t('AI_PLANNER_TITLE')}
            </h2>
            
            {!plan && !isLoading && (
                <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                    <div>
                        <label htmlFor="goal" className="block text-sm font-medium text-slate-300">{t('PRIMARY_GOAL')}</label>
                        <select id="goal" value={goal} onChange={e => setGoal(e.target.value as UserProfile['goal'])} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-200 focus:ring-cyan-500 focus:border-cyan-500">
                            <option value="MUSCLE_GAIN">{t('GOAL_MUSCLE_GAIN')}</option>
                            <option value="FAT_LOSS">{t('GOAL_FAT_LOSS')}</option>
                            <option value="ENDURANCE">{t('GOAL_ENDURANCE')}</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-slate-300">{t('TRAINING_EXPERIENCE')}</label>
                        <select id="experience" value={experience} onChange={e => setExperience(e.target.value)} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-200 focus:ring-cyan-500 focus:border-cyan-500">
                            <option value="新手">{t('EXP_BEGINNER')}</option>
                            <option value="中階">{t('EXP_INTERMEDIATE')}</option>
                            <option value="進階">{t('EXP_ADVANCED')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="days" className="block text-sm font-medium text-slate-300">{t('TRAINING_DAYS_PER_WEEK')}: <span className="font-bold text-cyan-400">{days}</span></label>
                        <input id="days" type="range" min="2" max="6" value={days} onChange={e => setDays(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 transition transform hover:scale-[1.02]">
                        <Sparkles className="w-5 h-5" />
                        {isLoading ? t('CREATING_PLAN_BUTTON') : t('CREATE_PLAN_BUTTON')}
                    </button>
                </form>
            )}

            {isLoading && (
                <div className="flex flex-col items-center justify-center h-48">
                    <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
                    <p className="mt-4 text-slate-400">{t('AI_PLANNER_LOADING')}</p>
                </div>
            )}
            
            {error && (
                 <div className="p-4 text-center bg-red-900/50 text-red-300 border border-red-500/30 rounded-lg">
                    <p className="font-bold">{t('ERROR_TITLE')}</p>
                    <p className="text-sm">{error}</p>
                     <button onClick={resetForm} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        {t('TRY_AGAIN_BUTTON')}
                    </button>
                </div>
            )}

            {plan && (
                <>
                    <PlanDisplay plan={plan} nutritionPlan={nutritionPlan} onSetPlan={handleSetPlan} />
                    
                    {!nutritionPlan && !isNutritionLoading && (
                        <button 
                            onClick={() => setShowTdeeModal(true)}
                            className="w-full mt-4 flex justify-center items-center gap-2 py-3 px-4 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition"
                        >
                            <UtensilsCrossed size={20} />
                            {t('GENERATE_NUTRITION_PLAN')}
                        </button>
                    )}

                    {isNutritionLoading && (
                        <div className="flex flex-col items-center justify-center h-32 mt-4">
                            <Loader2 className="w-10 h-10 animate-spin text-green-500" />
                            <p className="mt-3 text-slate-400">{t('NUTRITION_AI_LOADING')}</p>
                        </div>
                    )}
                    
                    {nutritionError && (
                        <div className="p-3 mt-4 text-center bg-red-900/50 text-red-300 border border-red-500/30 rounded-lg">
                            <p className="font-bold">{nutritionError}</p>
                            <button onClick={() => setNutritionError(null)} className="mt-2 text-sm underline">{t('CLOSE_BUTTON')}</button>
                        </div>
                    )}

                    <button onClick={resetForm} className="w-full mt-4 py-2 px-4 border border-slate-600 rounded-full shadow-sm text-md font-medium text-slate-300 bg-slate-700 hover:bg-slate-600">
                        {t('CREATE_NEW_PLAN_BUTTON')}
                    </button>
                </>
            )}

            {showTdeeModal && <NutritionTdeeModal onGenerate={handleGenerateNutrition} onClose={() => setShowTdeeModal(false)} />}

        </section>
    );
};