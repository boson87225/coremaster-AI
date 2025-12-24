import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Settings, Trash2, ArrowLeft, BrainCircuit, ShieldCheck, ShieldAlert, Zap, ExternalLink, Loader2, CheckCircle, WifiOff, Terminal } from './icons';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import { triggerKeySetup, checkHasApiKey } from '../services/geminiService';
import type { Page } from '../types';

interface SettingsPageProps {
    userId: string | null;
    setPage: (page: Page) => void;
}

const VercelInstructionCard: React.FC = () => {
    return (
        <div className="mt-4 p-5 bg-slate-900/90 rounded-2xl border border-orange-500/30 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex items-center gap-2 text-orange-400">
                <Terminal size={16} />
                <h4 className="font-bold text-xs uppercase tracking-widest">Vercel Setup Required</h4>
            </div>

            <div className="space-y-3">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                    在 Vercel 上使用此 App 需要設定環境變數。請依照以下步驟操作：
                </p>
                <ol className="text-[10px] text-slate-300 space-y-3 font-mono bg-black/20 p-3 rounded-lg border border-white/5">
                    <li className="flex gap-3">
                        <span className="text-orange-500 font-bold">01.</span>
                        <span>前往 <strong className="text-white">Vercel Dashboard</strong> 進入本專案的 <strong className="text-white">Settings</strong>。</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="text-orange-500 font-bold">02.</span>
                        <span>點選左側的 <strong className="text-white">Environment Variables</strong>。</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="text-orange-500 font-bold">03.</span>
                        <div className="flex flex-col gap-1">
                            <span>新增變數：</span>
                            <div className="flex gap-2 items-center text-[9px]">
                                <span className="text-slate-500">Key:</span>
                                <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400">API_KEY</code>
                            </div>
                            <div className="flex gap-2 items-center text-[9px]">
                                <span className="text-slate-500">Value:</span>
                                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">您的 Gemini API Key</span>
                            </div>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <span className="text-orange-500 font-bold">04.</span>
                        <span className="text-orange-300 font-bold uppercase tracking-wider">重要：設定完成後必須 Redeploy (重新部署) 才會生效。</span>
                    </li>
                </ol>
            </div>

            <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-[10px] font-bold text-slate-300 transition-all uppercase tracking-wider"
            >
                取得 Gemini API Key <ExternalLink size={12} />
            </a>
        </div>
    );
};

const ApiKeyLoginSection: React.FC = () => {
    const [isLinked, setIsLinked] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isVercelEnv, setIsVercelEnv] = useState(false);
    const { t } = useTranslation();

    const refreshStatus = useCallback(async () => {
        const status = await checkHasApiKey();
        setIsLinked(status);
        
        // 偵測是否處於外部環境（非 AI Studio Bridge）
        const hasBridge = !!((window as any).aistudio?.openSelectKey);
        setIsVercelEnv(!hasBridge);
    }, []);

    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    const handleLogin = async () => {
        // 如果是 Vercel 環境且未連結，點擊按鈕不觸發 API，而是聚焦教學
        if (isVercelEnv && !isLinked) {
            // 這裡可以加入一個抖動效果提示使用者看下方教學，目前先不做
            return; 
        }

        setIsLoading(true);
        try {
            const success = await triggerKeySetup();
            if (success) {
                setIsLinked(true);
            }
        } catch (e) {
            console.error("Login trigger failed:", e);
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    };

    return (
        <div className="p-6 glass rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 transition-all duration-700 ${isLinked ? 'bg-emerald-500/10' : 'bg-orange-500/10'}`}></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className={`p-2.5 rounded-2xl transition-all duration-500 ${isLinked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    <BrainCircuit size={22} className={isLoading ? 'animate-pulse' : ''} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Neural Link Center</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">AI Core Configuration</p>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 ${isLinked ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900/50 border-white/5'}`}>
                    <div className="flex items-center gap-3">
                        {isLinked ? <ShieldCheck className="text-emerald-500" size={18} /> : <ShieldAlert className="text-orange-500" size={18} />}
                        <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${isLinked ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {isLinked ? 'Core: Active' : 'Core: Offline'}
                        </span>
                    </div>
                    {isLinked && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>}
                </div>

                {!isVercelEnv && (
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed px-1">
                        連結您的 Gemini API 以啟用 AI 教練與影像辨識。
                    </p>
                )}

                {/* 按鈕區域：如果是 Vercel 且未連結，隱藏按鈕或改變樣式，這裡選擇隱藏按鈕直接顯示教學 */}
                {(!isVercelEnv || isLinked) && (
                    <button 
                        onClick={handleLogin}
                        disabled={isLoading || (isLinked && isVercelEnv)} // Vercel 環境下如果已連結，不允許按鈕操作
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all transform active:scale-[0.97] hover:brightness-110 ${
                            isLinked 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                        }`}
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : isLinked ? (
                            <>
                                <CheckCircle size={16} />
                                Link Established
                            </>
                        ) : (
                            <>
                                <Zap size={16} fill="currentColor" />
                                Establish Neural Link
                            </>
                        )}
                    </button>
                )}

                {/* Vercel 專用教學區塊 */}
                {isVercelEnv && !isLinked && <VercelInstructionCard />}

                <div className="flex justify-center gap-4 py-1">
                    <a 
                        href="https://ai.google.dev/gemini-api/docs/billing" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[9px] font-bold text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest"
                    >
                        Billing Info <ExternalLink size={10} />
                    </a>
                </div>
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
                <button onClick={() => setLanguage('zh')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${language === 'zh' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                    中文
                </button>
                <button onClick={() => setLanguage('en')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${language === 'en' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
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
                <p className="text-[8px] font-mono text-slate-700 uppercase tracking-[0.5em]">CoreMaster OS v4.3.0 • Vercel Ready</p>
            </div>
        </div>
    );
};
