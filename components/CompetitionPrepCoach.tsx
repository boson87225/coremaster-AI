
import React from 'react';
import { Swords, X } from './icons';
import { useTranslation } from '../context/LanguageContext';
import { ChatInterface } from './ChatInterface';
import { COMPETITION_PREP_SYSTEM_INSTRUCTION } from '../constants';

export const CompetitionPrepCoach: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useTranslation();
    return (
        <div className="mt-6 animate-fade-in relative">
            <button onClick={onClose} className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white">
                <X size={20} />
            </button>
            <div className="h-[400px]">
                <ChatInterface 
                    title={t('COMPETITION_PREP_TITLE')}
                    icon={<Swords size={20} className="text-red-400" />}
                    initialMessage={t('COMPETITION_PREP_GREETING')}
                    systemInstruction={COMPETITION_PREP_SYSTEM_INSTRUCTION}
                    accentColor="bg-red-600"
                />
            </div>
        </div>
    );
};
