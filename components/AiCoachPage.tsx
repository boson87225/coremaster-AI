
import React from 'react';
import { BrainCircuit } from './icons';
import { useTranslation } from '../context/LanguageContext';
import { ChatInterface } from './ChatInterface';
import { AI_COACH_SYSTEM_INSTRUCTION } from '../constants';

export const AiCoachPage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <section className="max-w-lg mx-auto h-[calc(100vh-180px)] flex flex-col">
            <ChatInterface 
                title={t('AI_COACH_TITLE')}
                icon={<BrainCircuit size={20} />}
                initialMessage={t('AI_COACH_GREETING')}
                systemInstruction={AI_COACH_SYSTEM_INSTRUCTION}
                sessionKey="ai_coach_v2"
                accentColor="bg-cyan-600"
            />
        </section>
    );
};
