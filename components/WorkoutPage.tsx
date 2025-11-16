
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
    const [subMode, setSubMode] = useState<WorkoutPageMode>('cardio');
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
        <div className="space-y-6">
            <div className="flex justify-around p-2 bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg sticky top-2 z-10 border border-slate-700">
                <TabButton<WorkoutPageMode> 
                    mode="cardio" 
                    currentMode={subMode} 
                    setMode={setSubMode} 
                    label={t('WORKOUT_MODE_CARDIO')}
                    icon={<HeartPulse className="w-5 h-5" />}
                />
                <TabButton<WorkoutPageMode> 
                    mode="strength" 
                    currentMode={subMode} 
                    setMode={setSubMode} 
                    label={t('WORKOUT_MODE_STRENGTH')}
                    icon={<Dumbbell className="w-5 h-5" />}
                />
                <TabButton<WorkoutPageMode> 
                    mode="specialized" 
                    currentMode={subMode} 
                    setMode={setSubMode} 
                    label={t('WORKOUT_MODE_SPECIALIZED')}
                    icon={<Zap className="w-5 h-5" />}
                />
            </div>

            {renderSubContent()}
        </div>
    );
};