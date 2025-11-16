
import React, { useContext } from 'react';
import { Settings, Trash2, ArrowLeft } from './icons';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import type { Page } from '../types';

interface SettingsPageProps {
    userId: string | null;
    setPage: (page: Page) => void;
}

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage, t } = useTranslation();
    return (
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
             <h3 className="text-lg font-bold text-slate-200 mb-3">{t('LANGUAGE_SETTINGS')}</h3>
            <div className="flex space-x-2">
                <button onClick={() => setLanguage('zh')} className={`flex-1 py-2 rounded-md font-semibold ${language === 'zh' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    中文
                </button>
                <button onClick={() => setLanguage('en')} className={`flex-1 py-2 rounded-md font-semibold ${language === 'en' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    English
                </button>
            </div>
        </div>
    );
};

const DataManagement: React.FC = () => {
    const { clearPlan } = useContext(PlanContext);
    const { t } = useTranslation();

    const handleClearData = () => {
        if (window.confirm(t('CLEAR_DATA_CONFIRMATION'))) {
            clearPlan();
            // Optional: Show a success message after clearing
        }
    };
    return (
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-bold text-slate-200 mb-2">{t('DATA_MANAGEMENT')}</h3>
            <p className="text-sm text-slate-400 mb-4">{t('CLEAR_DATA_DESC')}</p>
            <button
                onClick={handleClearData}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600/80 text-white font-bold rounded-full hover:bg-red-700 transition"
            >
                <Trash2 size={18} />
                {t('CLEAR_ALL_DATA_BUTTON')}
            </button>
        </div>
    );
};


export const SettingsPage: React.FC<SettingsPageProps> = ({ userId, setPage }) => {
    const { t } = useTranslation();

    return (
        <section className="p-4 md:p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl max-w-lg mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-cyan-300 flex items-center">
                    <Settings className="w-6 h-6 mr-2" /> {t('SETTINGS_TITLE')}
                </h2>
                <button onClick={() => setPage('profile')} className="flex items-center gap-2 text-sm text-cyan-400 hover:underline">
                    <ArrowLeft size={16} /> {t('BACK_TO_PROFILE')}
                </button>
            </div>
            
            <LanguageSwitcher />
            <DataManagement />

        </section>
    );
};
