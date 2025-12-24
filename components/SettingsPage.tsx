import React, { useContext, useState, useEffect } from 'react';
import { Settings, Trash2, ArrowLeft, BrainCircuit, ShieldCheck, ShieldAlert, Zap, ExternalLink, Loader2 } from './icons';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import { triggerKeySetup, checkHasApiKey } from '../services/geminiService';
import type { Page } from '../types';

interface SettingsPageProps {
    userId: string | null;
    setPage: (page: Page) => void;
}

const ApiKeyLoginSection: React.FC = () => {
    const [isLinked, setIsLinked] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const checkStatus = async () => {
            const status = await checkHasApiKey();
            setIsLinked(status);
        };
        checkStatus();
    }, []);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await triggerKeySetup();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 glass rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-cyan-500/20 transition-all duration-700"></div>
            
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 rounded-2xl ${isLinked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    <BrainCircuit size={22} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Neural Link Center</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">AI Core Management</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isLinked ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-white/5'}`}>
                    <div className="flex items-center gap-3">
                        {isLinked ? <ShieldCheck className="text-emerald-500" size={18} /> : <ShieldAlert className="text-orange-500" size={18} />}
                        <span className={`text-xs font-black uppercase tracking-widest ${isLinked ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {isLinked ? 'Status: Authenticated' : 'Status: Offline'}
                        </span>
                    </div>
                    {isLinked && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>}
                </div>

                <p className="text-[11px] text-slate-400 font-medium leading-relaxed px-1">
                    若要解鎖 AI 教練、智慧課表產生器及食物影像辨識，您必須連結一個有效的 Gemini API 金鑰。金鑰將安全地儲存在您的環境中。
                </p>

                <button 
                    onClick={handleLogin}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
                        isLinked 
                        ? 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10' 
                        : 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                    }`}
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <>
                            <Zap size={16} fill="currentColor" />
                            {isLinked ? 'Reconnect AI Core' : 'Establish Neural Link'}
                        </>
                    )}
                </button>

                <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 hover:text-cyan-400 transition-colors py-2 uppercase tracking-tighter"
                >
                    Billing Documentation <ExternalLink size={10} />
                </a>
            </div>
        </div>
    );
};

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage, t } = useTranslation();
    return (
        <div className="p-5 glass rounded-[2.5rem] border border-white/10">
             <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">{t('LANGUAGE_SETTINGS')}</h3>
            <div className="flex gap-2">
                <button onClick={() => setLanguage('zh')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${language === 'zh' ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                    中文
                </button>
                <button onClick={() => setLanguage('en')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${language === 'en' ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
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
        }
    };
    return (
        <div className="p-5 glass rounded-[2.5rem] border border-white/10 border-red-500/10">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">{t('DATA_MANAGEMENT')}</h3>
            <p className="text-[10px] text-slate-500 font-medium mb-4 uppercase tracking-tighter">{t('CLEAR_DATA_DESC')}</p>
            <button
                onClick={handleClearData}
                className="w-full py-3 bg-red-600/10 text-red-500 font-black text-xs rounded-xl border border-red-500/20 hover:bg-red-600/20 transition-all uppercase tracking-widest"
            >
                {t('CLEAR_ALL_DATA_BUTTON')}
            </button>
        </div>
    );
};


export const SettingsPage: React.FC<SettingsPageProps> = ({ userId, setPage }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <header className="flex items-center justify-between px-2">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Settings</h1>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] font-bold mt-2">Protocol Configuration</p>
                </div>
                <button onClick={() => setPage('profile')} className="w-10 h-10 rounded-2xl glass flex items-center justify-center border border-white/10 hover:border-cyan-500 transition-colors">
                    <ArrowLeft size={18} className="text-slate-400" />
                </button>
            </header>
            
            <ApiKeyLoginSection />
            <LanguageSwitcher />
            <DataManagement />

            <div className="text-center pt-4">
                <p className="text-[8px] font-mono text-slate-700 uppercase tracking-[0.5em]">CoreMaster OS v4.2.0 • Build 8821</p>
            </div>
        </div>
    );
};
