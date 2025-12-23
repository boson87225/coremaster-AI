
import React, { useState } from 'react';
import { CardioTrainingPage } from './CardioTrainingPage';
import { StrengthTrainingPage } from './StrengthTrainingPage';
import { SpecializedTrainingPage } from './SpecializedTrainingPage';
import { TabButton } from './TabButton';
import { HeartPulse, Dumbbell, Zap } from './icons';
import type { WorkoutPageMode } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface WorkoutPageProps {
    userId: string | null;
}

export const WorkoutPage: React.FC<WorkoutPageProps> = ({ userId }) => {
    const [subMode, setSubMode] = useState<WorkoutPageMode>('strength');
    const { t } = useTranslation();

    const renderSubContent = () => {
        switch (subMode) {
            case 'cardio':
                return <CardioTrainingPage userId={userId} />;
            case 'strength':
                return <StrengthTrainingPage />;
            case 'specialized':
                return <SpecializedTrainingPage />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <header className="px-2">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Training</h1>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] font-bold mt-2">Selection Module</p>
            </header>

            <div className="flex justify-between p-1.5 glass rounded-[2rem] border border-white/10 sticky top-2 z-20 shadow-2xl shadow-black/40">
                <TabButton<WorkoutPageMode> 
                    mode="cardio" 
                    currentMode={subMode} 
                    setMode={setSubMode} 
                    label={t('WORKOUT_MODE_CARDIO')}
                    icon={<HeartPulse className="w-4 h-4" />}
                    activeColor="bg-white text-slate-950"
                />
                <TabButton<WorkoutPageMode> 
                    mode="strength" 
                    currentMode={subMode} 
                    setMode={setSubMode} 
                    label={t('WORKOUT_MODE_STRENGTH')}
                    icon={<Dumbbell className="w-4 h-4" />}
                    activeColor="bg-white text-slate-950"
                />
                <TabButton<WorkoutPageMode> 
                    mode="specialized" 
                    currentMode={subMode} 
                    setMode={setSubMode} 
                    label={t('WORKOUT_MODE_SPECIALIZED')}
                    icon={<Zap className="w-4 h-4" />}
                    activeColor="bg-white text-slate-950"
                />
            </div>

            <div className="animate-fade-in">
                {renderSubContent()}
            </div>
        </div>
    );
};
