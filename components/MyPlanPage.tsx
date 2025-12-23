
import React, { useContext, useMemo } from 'react';
import { PlanContext } from '../context/PlanContext';
import { ClipboardList, Zap, Sparkles, UtensilsCrossed, Trash2, Edit } from './icons';
import type { Page } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { WorkoutPlanCard } from './WorkoutPlanCard';

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
  const strokeWidth = isLarge ? 12 : 8;
  const dimensions = isLarge ? 'w-36 h-36' : 'w-24 h-24';
  const textClass = isLarge ? 'text-3xl' : 'text-xl';
  const subTextClass = isLarge ? 'text-[10px]' : 'text-[8px]';

  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-center text-center group">
      <div className={`relative ${dimensions} transform group-hover:scale-105 transition-transform duration-500`}>
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            className="text-white/5"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <circle
            className={`${color} transition-all duration-1000 ease-out`}
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
          <span className={`${textClass} font-black text-white leading-none`}>{Math.round(value)}</span>
          <span className={`${subTextClass} text-slate-500 font-bold uppercase tracking-tighter mt-1`}>/ {Math.round(max)} {unit}</span>
        </div>
      </div>
      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
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
             <div className="p-8 glass rounded-[2.5rem] border border-white/5">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="p-4 bg-emerald-500/10 rounded-[1.5rem]"><UtensilsCrossed className="w-8 h-8 text-emerald-400" /></div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{t('NUTRITION_TRACKING')}</h3>
                        <p className="text-sm text-slate-400 mt-2 font-medium max-w-[250px]">
                            {t('NUTRITION_TRACKING_NO_PLAN')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    
    const { dailyCalorieTarget } = activeNutritionPlan;
    const proteinTarget = dailyCalorieTarget * 0.3 / 4;
    const carbsTarget = dailyCalorieTarget * 0.4 / 4;
    const fatTarget = dailyCalorieTarget * 0.3 / 9;
    
    return (
        <div className="p-8 glass rounded-[3rem] border border-white/10 space-y-8 bg-gradient-to-b from-white/5 to-transparent">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 text-white rounded-xl"><UtensilsCrossed className="w-4 h-4" /></div>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">{t('TODAYS_NUTRITION_GOALS')}</h3>
                </div>
            </div>
            
            <div className="flex justify-center py-4">
                <CircularProgress 
                    value={totals.calories} 
                    max={dailyCalorieTarget} 
                    color="text-emerald-400" 
                    label={t('TOTAL_CALORIES')} 
                    unit={t('CALORIES_UNIT_SHORT')}
                    size="large"
                />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5">
                <CircularProgress 
                    value={totals.protein} 
                    max={proteinTarget} 
                    color="text-cyan-400" 
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
                    color="text-rose-400" 
                    label={t('FAT')} 
                    unit="g" 
                    size="small"
                />
            </div>
        </div>
    );
};

interface MyPlanPageProps {
    setPage: (page: Page) => void;
}

export const MyPlanPage: React.FC<MyPlanPageProps> = ({ setPage }) => {
    const { activeWorkoutPlan, clearPlan } = useContext(PlanContext);
    const { t } = useTranslation();

    const dayIndex = 0; 

    if (!activeWorkoutPlan) {
        return (
            <div className="space-y-6 animate-fade-in p-8 pb-20">
                <div className="text-center mb-8">
                    <div className="relative mx-auto mb-6 w-20 h-20">
                        <ClipboardList className="w-20 h-20 text-slate-700" />
                        <Sparkles className="absolute -top-2 -right-2 text-cyan-400 animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{t('NO_PLAN_SET_TITLE')}</h1>
                    <p className="text-slate-400 font-medium px-4 mt-2">{t('NO_PLAN_SET_DESC')}</p>
                </div>

                <div className="space-y-4">
                  <button
                      onClick={() => setPage('ai_planner')}
                      className="w-full flex items-center gap-5 p-6 glass rounded-[2.5rem] border border-white/5 hover:border-cyan-500/30 transition-all text-left group"
                  >
                      <div className="w-14 h-14 bg-cyan-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Sparkles size={24} />
                      </div>
                      <div>
                          <p className="font-black uppercase tracking-tight text-base text-white">{t('AI_PLANNER_CARD_TITLE')}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t('AI_PLANNER_CARD_DESC')}</p>
                      </div>
                  </button>

                  <button
                      onClick={() => setPage('manual_planner')}
                      className="w-full flex items-center gap-5 p-6 glass rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 transition-all text-left group"
                  >
                      <div className="w-14 h-14 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Edit size={24} />
                      </div>
                      <div>
                          <p className="font-black uppercase tracking-tight text-base text-white">{t('MANUAL_PLANNER_CARD_TITLE')}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t('MANUAL_PLANNER_CARD_DESC')}</p>
                      </div>
                  </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
             <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">{t('MY_PLAN_TITLE')}</h1>
                    <p className="text-xs font-bold text-cyan-400 mt-2 uppercase tracking-widest">{activeWorkoutPlan.planTitle}</p>
                </div>
                <button 
                    onClick={() => {if(window.confirm(t('CLEAR_DATA_CONFIRMATION'))) clearPlan()}} 
                    className="p-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-colors"
                    title={t('CLEAR_BUTTON')}
                >
                    <Trash2 size={20} />
                </button>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-cyan-500 text-white rounded-xl"><Zap className="w-4 h-4" /></div>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">{t('TODAYS_WORKOUT')}</h3>
                </div>
                <WorkoutPlanCard plan={activeWorkoutPlan} showAllDays={false} activeDayIndex={dayIndex} />
             </div>

             <NutritionTracker />
        </div>
    );
};
