import React, { useContext, useMemo } from 'react';
import { PlanContext } from '../context/PlanContext';
import { WorkoutContext } from '../context/WorkoutContext';
import { ClipboardList, Play, Zap, Sparkles, UtensilsCrossed, Trash2 } from './icons';
import type { Page } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface CircularProgressProps {
  value: number;
  max: number;
  label: string;
  color: string;
  unit: string;
  size?: 'large' | 'small';
}

const CircularProgress: React.FC<CircularProgressProps> = ({ value, max, label, color, unit, size = 'large' }) => {
  const isLarge = size === 'large';
  const radius = isLarge ? 50 : 35;
  const strokeWidth = isLarge ? 10 : 6;
  const dimensions = isLarge ? 'w-28 h-28' : 'w-20 h-20';
  const textClass = isLarge ? 'text-2xl' : 'text-lg';
  const subTextClass = isLarge ? 'text-xs' : 'text-[10px]';

  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className={`relative ${dimensions}`}>
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            className="text-slate-700"
            strokeWidth={strokeWidth - 2}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <circle
            className={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${textClass} font-bold text-white`}>{Math.round(value)}</span>
          <span className={`${subTextClass} text-slate-400`}>/ {Math.round(max)} {unit}</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-300">{label}</p>
    </div>
  );
};


const NutritionTracker: React.FC = () => {
    const { activeNutritionPlan, foodLog } = useContext(PlanContext);
    const { t } = useTranslation();
    
    const todaysLog = useMemo(() => {
        const today = new Date().toDateString();
        return foodLog.filter(item => new Date(item.timestamp).toDateString() === today);
    }, [foodLog]);

    const totals = useMemo(() => {
        return todaysLog.reduce((acc, item) => {
            acc.calories += item.calories;
            acc.protein += item.protein;
            acc.carbs += item.carbs;
            acc.fat += item.fat;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }, [todaysLog]);

    if (!activeNutritionPlan) {
        return (
             <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-full"><UtensilsCrossed className="w-5 h-5 text-green-400" /></div>
                    <h3 className="text-lg font-bold text-slate-200">{t('NUTRITION_TRACKING')}</h3>
                </div>
                <p className="text-sm text-slate-400 mt-2 text-center py-4">
                    {t('NUTRITION_TRACKING_NO_PLAN')}
                </p>
            </div>
        );
    }
    
    const { dailyCalorieTarget } = activeNutritionPlan;
    // Assuming a 40% carbs, 30% protein, 30% fat split for target calculation
    const proteinTarget = dailyCalorieTarget * 0.3 / 4;
    const carbsTarget = dailyCalorieTarget * 0.4 / 4;
    const fatTarget = dailyCalorieTarget * 0.3 / 9;
    
    return (
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-full"><UtensilsCrossed className="w-5 h-5 text-green-400" /></div>
                <h3 className="text-lg font-bold text-slate-200">{t('TODAYS_NUTRITION_GOALS')}</h3>
            </div>
            
            <div className="flex justify-center pt-2">
                <CircularProgress 
                    value={totals.calories} 
                    max={dailyCalorieTarget} 
                    color="text-green-500" 
                    label={t('TOTAL_CALORIES')} 
                    unit={t('CALORIES_UNIT_SHORT')}
                    size="large"
                />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-700/50">
                <CircularProgress 
                    value={totals.protein} 
                    max={proteinTarget} 
                    color="text-blue-500" 
                    label={t('PROTEIN')} 
                    unit="g" 
                    size="small"
                />
                <CircularProgress 
                    value={totals.carbs} 
                    max={carbsTarget} 
                    color="text-yellow-400" 
                    label={t('CARBS')} 
                    unit="g" 
                    size="small"
                />
                <CircularProgress 
                    value={totals.fat} 
                    max={fatTarget} 
                    color="text-purple-500" 
                    label={t('FAT')} 
                    unit="g" 
                    size="small"
                />
            </div>
        </div>
    );
};


const TodaysWorkout: React.FC = () => {
    const { activeWorkoutPlan } = useContext(PlanContext);
    const { startWorkout } = useContext(WorkoutContext);
    const { t } = useTranslation();

    if (!activeWorkoutPlan) return null;

    // Logic to determine today's workout, e.g., based on the day of the week or sequentially.
    // For simplicity, we'll just show the first day as an example.
    const dayIndex = 0; // This can be made more dynamic later
    const todaysWorkoutDay = activeWorkoutPlan.days[dayIndex];
    
    if (!todaysWorkoutDay) {
        return <p>{t('REST_DAY')}</p>;
    }

    return (
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-cyan-500/10 rounded-full"><ClipboardList className="w-5 h-5 text-cyan-400" /></div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-200">{t('TODAYS_WORKOUT')}: {todaysWorkoutDay.title}</h3>
                    <p className="text-sm text-cyan-400">{todaysWorkoutDay.focus}</p>
                 </div>
            </div>
            
            <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                {todaysWorkoutDay.exercises.map((ex, index) => (
                    <li key={index} className="text-sm text-slate-300 flex justify-between">
                        <span>{ex.name}</span>
                        <span className="font-mono text-slate-400">{ex.sets} x {ex.reps}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => startWorkout(activeWorkoutPlan, dayIndex)}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-cyan-600 text-white font-bold rounded-full shadow-lg hover:bg-cyan-700 transition"
            >
                <Play size={20} />
                {t('START_TODAYS_WORKOUT')}
            </button>
        </div>
    );
};

// Fix: Define the props interface for the MyPlanPage component.
interface MyPlanPageProps {
    setPage: (page: Page) => void;
}

export const MyPlanPage: React.FC<MyPlanPageProps> = ({ setPage }) => {
    const { activeWorkoutPlan, clearPlan } = useContext(PlanContext);
    const { t } = useTranslation();

    if (!activeWorkoutPlan) {
        return (
            <div className="space-y-6 animate-fade-in p-4 text-center">
                <ClipboardList className="w-16 h-16 mx-auto text-slate-600" />
                <h1 className="text-2xl font-bold text-white">{t('NO_PLAN_SET_TITLE')}</h1>
                <p className="text-slate-400">{t('NO_PLAN_SET_DESC')}</p>
                <div className="space-y-4 pt-4">
                    <button
                        onClick={() => setPage('ai_planner')}
                        className="w-full flex items-center justify-center gap-3 p-4 bg-cyan-600/90 text-white rounded-xl shadow-lg transition transform hover:scale-105"
                    >
                        <Sparkles className="w-6 h-6" />
                        <div className="text-left">
                            <p className="font-bold">{t('AI_PLANNER_CARD_TITLE')}</p>
                            <p className="text-xs">{t('AI_PLANNER_CARD_DESC')}</p>
                        </div>
                    </button>
                    <button
                        onClick={() => setPage('workout')}
                        className="w-full flex items-center justify-center gap-3 p-4 bg-slate-700 text-white rounded-xl shadow-lg transition transform hover:scale-105"
                    >
                        <Zap className="w-6 h-6" />
                         <div className="text-left">
                            <p className="font-bold">{t('SPECIALIZED_PLAN_CARD_TITLE')}</p>
                            <p className="text-xs">{t('SPECIALIZED_PLAN_CARD_DESC')}</p>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">{t('MY_PLAN_TITLE')}</h1>
                <button 
                    onClick={clearPlan} 
                    className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1 rounded-full"
                    title={t('CLEAR_PLAN_TOOLTIP')}
                >
                    <Trash2 size={14} />
                    {t('CLEAR_BUTTON')}
                </button>
             </div>
             <p className="text-slate-400 -mt-4">{activeWorkoutPlan.planTitle}</p>
             
             <TodaysWorkout />
             <NutritionTracker />

        </div>
    );
};