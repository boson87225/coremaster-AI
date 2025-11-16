import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { PlanContext } from '../context/PlanContext';
import { getAiInsightTip } from '../services/geminiService';
import { Sparkles, Loader2, RefreshCw, Dumbbell, ArrowUpRight, ArrowDownRight, Minus, Scale, HeartPulse } from './icons';
import { useTranslation } from '../context/LanguageContext';
import type { Page } from '../types';

const AiInsight: React.FC = () => {
    const { t } = useTranslation();
    const { activeWorkoutPlan, activeNutritionPlan, weightLog, foodLog } = useContext(PlanContext);
    const [tip, setTip] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateTip = useCallback(async () => {
        if (!process.env.API_KEY) {
            setError(t('AI_INSIGHT_ERROR_NO_KEY'));
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const weightTrend = () => {
                if (weightLog.length < 2) return 'stable';
                const diff = weightLog[0].weight - weightLog[1].weight;
                if (diff > 0.1) return 'increasing';
                if (diff < -0.1) return 'decreasing';
                return 'stable';
            };

            const calorieStatus = () => {
                if (!activeNutritionPlan) return 'unknown';
                const today = new Date().toDateString();
                const todaysCalories = foodLog
                    .filter(item => new Date(item.timestamp).toDateString() === today)
                    .reduce((sum, item) => sum + item.calories, 0);
                const target = activeNutritionPlan.dailyCalorieTarget;
                if (todaysCalories > target * 1.1) return 'over';
                if (todaysCalories < target * 0.9) return 'under';
                return 'on track';
            };

            const insightData = {
                goal: activeWorkoutPlan?.planSummary,
                todayWorkoutFocus: activeWorkoutPlan?.days[0]?.focus,
                weightTrend: weightTrend(),
                calorieStatus: calorieStatus(),
            };
            
            const newTip = await getAiInsightTip(insightData);
            setTip(newTip);
            sessionStorage.setItem('coreMasterTip', newTip);
        } catch (err) {
            setError(t('AI_INSIGHT_ERROR'));
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkoutPlan, activeNutritionPlan, weightLog, foodLog, t]);

    useEffect(() => {
        const cachedTip = sessionStorage.getItem('coreMasterTip');
        if (cachedTip) {
            setTip(cachedTip);
        } else {
            generateTip();
        }
    }, [generateTip]);

    const handleRefresh = () => {
        sessionStorage.removeItem('coreMasterTip');
        generateTip();
    };

    return (
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-full"><Sparkles className="w-5 h-5 text-yellow-400" /></div>
                    <h3 className="text-lg font-bold text-slate-200">{t('AI_INSIGHT_TITLE')}</h3>
                </div>
                <button onClick={handleRefresh} disabled={isLoading} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 disabled:opacity-50">
                    <RefreshCw size={16} />
                </button>
            </div>
            {isLoading && <p className="text-sm text-slate-400 text-center py-4">{t('AI_INSIGHT_LOADING')}</p>}
            {error && <p className="text-sm text-red-400 text-center py-4">{error}</p>}
            {tip && !isLoading && <p className="text-slate-300">{tip}</p>}
        </div>
    );
}

const WeeklyActivity: React.FC = () => {
    const { activeWorkoutPlan } = useContext(PlanContext);
    const { t } = useTranslation();

    const planDays = activeWorkoutPlan?.days.length || 0;
    
    return (
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-bold text-slate-200 mb-4">{t('WEEKLY_ACTIVITY_TITLE')}</h3>
            <div className="flex justify-around">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            i < planDays ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-200' : 'bg-slate-700 text-slate-400'
                        }`}>
                           {i < planDays ? <Dumbbell size={18} /> : <HeartPulse size={18} />}
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                            { i === 0 ? t('NEXT_WORKOUT') : i < planDays ? t('DAY_SHORT', {day: i + 1}) : t('REST_DAY_SHORT') }
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProgressSnapshot: React.FC = () => {
    const { activeNutritionPlan, weightLog, foodLog } = useContext(PlanContext);
    const { t } = useTranslation();

    const weightData = useMemo(() => {
        if (weightLog.length === 0) return { value: t('NO_WEIGHT_DATA'), trend: null };
        const latest = weightLog[0].weight.toFixed(1);
        if (weightLog.length < 2) return { value: `${latest} kg`, trend: null };

        const previous = weightLog[1].weight;
        const diff = weightLog[0].weight - previous;
        
        let trend: 'up' | 'down' | 'same' = 'same';
        if (diff > 0.1) trend = 'up';
        if (diff < -0.1) trend = 'down';

        return { value: `${latest} kg`, trend };
    }, [weightLog, t]);

    const calorieData = useMemo(() => {
        if (!activeNutritionPlan) return { value: t('NO_NUTRITION_PLAN') };
        const today = new Date().toDateString();
        const todaysCalories = foodLog
            .filter(item => new Date(item.timestamp).toDateString() === today)
            .reduce((sum, item) => sum + item.calories, 0);
        return { value: `${Math.round(todaysCalories)} / ${activeNutritionPlan.dailyCalorieTarget}` };
    }, [foodLog, activeNutritionPlan, t]);

    const trendIcons = {
        up: <ArrowUpRight className="w-5 h-5 text-red-400" />,
        down: <ArrowDownRight className="w-5 h-5 text-green-400" />,
        same: <Minus className="w-5 h-5 text-slate-400" />,
    };

    return (
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-bold text-slate-200 mb-4">{t('PROGRESS_SNAPSHOT_TITLE')}</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-semibold">
                        <Scale size={14} /> {t('LATEST_WEIGHT')}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <p className="text-2xl font-bold text-slate-200">{weightData.value}</p>
                        {weightData.trend && trendIcons[weightData.trend]}
                    </div>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                     <p className="text-slate-400 text-sm font-semibold">{t('TODAY_CALORIES')}</p>
                     <p className="text-2xl font-bold text-slate-200 mt-1">{calorieData.value}</p>
                </div>
            </div>
        </div>
    );
}

export const HomePage: React.FC<{ setPage: (page: Page) => void; }> = ({ setPage }) => {
    const { activeWorkoutPlan } = useContext(PlanContext);
    const { t } = useTranslation();

    if (!activeWorkoutPlan) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-4 animate-fade-in">
                <Dumbbell className="w-16 h-16 text-cyan-400" />
                <h1 className="text-3xl font-bold text-white">{t('HOME_NO_PLAN_TITLE')}</h1>
                <p className="text-slate-400 max-w-sm">{t('HOME_NO_PLAN_DESC')}</p>
                <button
                    onClick={() => setPage('ai_planner')}
                    className="w-full max-w-sm flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 text-white font-bold rounded-full shadow-lg hover:bg-cyan-700 transition"
                >
                    <Sparkles size={20} />
                    {t('HOME_CTA_AI_PLANNER')}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-white">{t('HOME_WELCOME')}</h1>
            <AiInsight />
            <WeeklyActivity />
            <ProgressSnapshot />
        </div>
    );
};