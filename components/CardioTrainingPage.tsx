
import React, { useState } from 'react';
import { HiitTimer } from './HiitTimer';
import { LissTimer } from './LissTimer';
import { TabButton } from './TabButton';
import { HeartPulse, Activity, Clock } from './icons';
import type { CardioMode } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface CardioTrainingPageProps {
    userId: string | null;
}

export const CardioTrainingPage: React.FC<CardioTrainingPageProps> = ({ userId }) => {
    const [cardioMode, setCardioMode] = useState<CardioMode>('hiit');
    const { t } = useTranslation();

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-slate-700 pb-3 flex items-center">
                <HeartPulse className="w-6 h-6 mr-2" /> {t('CARDIO_TRAINING_TITLE')}
            </h2>
            
            <div className="flex justify-center space-x-4 mb-6">
                <TabButton<CardioMode> 
                    mode="hiit" 
                    currentMode={cardioMode} 
                    setMode={setCardioMode} 
                    label={t('HIIT_TAB')}
                    icon={<Activity className="w-5 h-5" />}
                />
                <TabButton<CardioMode> 
                    mode="liss" 
                    currentMode={cardioMode} 
                    setMode={setCardioMode} 
                    label={t('LISS_TAB')}
                    icon={<Clock className="w-5 h-5" />}
                />
            </div>
            
            {cardioMode === 'hiit' && <HiitTimer userId={userId} />}
            {cardioMode === 'liss' && <LissTimer userId={userId} />}
        </section>
    );
};