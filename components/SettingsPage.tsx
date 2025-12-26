import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Settings, Trash2, ArrowLeft, BrainCircuit, ShieldCheck, ShieldAlert, Zap, ExternalLink, Loader2, CheckCircle, WifiOff, Terminal, RefreshCw, Edit, FolderLock, Unlock, Copy, X } from './icons';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import { triggerKeySetup, checkHasApiKey, setCustomApiKey, removeCustomApiKey, getEffectiveApiKey } from '../services/geminiService';
import type { Page } from '../types';

interface SettingsPageProps {
    userId: string | null;
    setPage: (page: Page) => void;
}

const SecretVault: React.FC = () => {
  const code = "AIzaSyCtsmsfG27Y5WoZAYDsgrmyOrvHB9Pdc_I";
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) {
      return (
          <div className="mt-8 flex justify-center animate-bounce">
              <button 
                onClick={() => setIsOpen(true)} 
                className="flex flex-col items-center gap-2 text-slate-700 hover:text-cyan-500 transition-colors group"
              >
                  <FolderLock size={32} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Open Vault</span>
              </button>
          </div>
      )
  }

  return (
      <div className="mt-6 p-5 bg-slate-950 rounded-2xl border border-cyan-500/30 animate-fade-in relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500"></div>
          
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-cyan-400">
                  <div className="p-1.5 bg-cyan-500/10 rounded-lg"><Unlock size={14} /></div>
                  <h4 className="text-xs font-black uppercase tracking-widest">Emergency Access Key</h4>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={16}/></button>
          </div>

          <div className="bg-black/40 p-4 rounded-xl flex items-center justify-between gap-3 border border-white/5 group hover:border-cyan-500/30 transition-colors">
              <code className="text-xs text-slate-300 font-mono truncate select-all">{code}</code>
              <button 
                  onClick={handleCopy}
                  className={`p-2 rounded-lg text-white transition-all transform active:scale-90 ${copied ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-white/10 hover:bg-white/20'}`}
                  title="Copy Key"
              >
                  {copied ? <CheckCircle size={14} /> : <Copy size={14}/>}
              </button>
          </div>
          
          <p className="text-[10px] text-slate-500 mt-3 text-center leading-relaxed">
              Use this key in the <span className="text-cyan-400 font-bold">"手動輸入 API Key"</span> section above if you are experiencing connection issues.
          </p>
      </div>
  );
}

const ManualKeyInputCard: React.FC<{ isLinked: boolean, onUpdate: () => void }> = ({ isLinked, onUpdate }) => {
    const [inputValue, setInputValue] = useState('');
    const [showInput, setShowInput] = useState(false);
    
    useEffect(() => {
        // Check if we are using a manual key
        const currentKey = getEffectiveApiKey();
        const envKey = process.env.API_KEY || "";
        // If current key is different from env key (or env key is empty), it might be manual
        if (currentKey && currentKey !== envKey) {
            setInputValue(currentKey); 
        }
    }, [isLinked]);

    const handleSave = () => {
        if (inputValue.trim().length > 10) {
            setCustomApiKey(inputValue);
            onUpdate();
            setShowInput(false);
            alert("API Key 已儲存至此裝置！");
        } else {
            alert("請輸入有效的 API Key");
        }
    };

    const handleClear = () => {
        if(confirm("確定要移除此裝置上的 API Key 嗎？")) {
            removeCustomApiKey();
            setInputValue("");
            onUpdate();
        }
    };

    return (
        <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-700 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Edit size={16} />
                    <h4 className="font-bold text-xs uppercase tracking-widest">手動輸入 API Key</h4>
                </div>
                <button 
                    onClick={() => setShowInput(!showInput)} 
                    className="text-[10px] text-slate-400 underline hover:text-white"
                >
                    {showInput ? "隱藏" : "展開設定"}
                </button>
            </div>

            {showInput && (
                <div className="space-y-3 animate-fade-in">
                    <p className="text-[10px] text-slate-400">
                        如果您無法設定 Vercel 環境變數，可以直接在此貼上您的 API Key。Key 將僅儲存於您的瀏覽器中。
                    </p>
                    <div className="flex gap-2">
                        <input 
                            type="password" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="貼上 AIza 開頭的金鑰..."
                            className="flex-1 bg-black/30 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                        />
                        <button 
                            onClick={handleSave}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                        >
                            儲存
                        </button>
                    </div>
                    {isLinked && (
                        <button onClick={handleClear} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
                            <Trash2 size={10} /> 移除儲存的 Key
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const VercelInstructionCard: React.FC = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleForceRefresh = async () => {
        if (!window.confirm("這將清除 App 快取並重新載入頁面，以確保新的 API Key 生效。是否繼續？")) return;
        
        setIsRefreshing(true);
        try {
            // 1. Unregister Service Worker
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            }
            // 2. Clear Caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(name => caches.delete(name))
                );
            }
        } catch (e) {
            console.error("Cache clear failed", e);
        } finally {
            // 3. Force Reload
            window.location.reload();
        }
    };

    return (
        <div className="mt-4 p-5 bg-slate-900/90 rounded-2xl border border-orange-500/30 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex items-center gap-2 text-orange-400">
                <Terminal size={16} />
                <h4 className="font-bold text-xs uppercase tracking-widest">Vercel Setup (Optional)</h4>
            </div>

            <div className="space-y-3">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                    若要讓所有使用者共用 Key，請在 Vercel 設定環境變數。若僅個人使用，請使用上方的「手動輸入」功能。
                </p>
            </div>

            <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-[10px] font-bold text-slate-300 transition-all uppercase tracking-wider"
            >
                取得 Gemini API Key <ExternalLink size={12} />
            </a>

            <div className="pt-2 border-t border-white/5">
                 <button 
                    onClick={handleForceRefresh}
                    disabled={isRefreshing}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-500/30 rounded-xl text-[10px] font-bold text-cyan-400 transition-all uppercase tracking-wider"
                >
                    {isRefreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    強制更新並重新載入 (Fix Cache)
                </button>
            </div>
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

                {/* 按鈕區域 */}
                {(!isVercelEnv) && (
                    <button 
                        onClick={handleLogin}
                        disabled={isLoading}
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

                {/* Vercel 環境下顯示手動輸入與教學 */}
                {isVercelEnv && (
                    <>
                        <ManualKeyInputCard isLinked={!!isLinked} onUpdate={refreshStatus} />
                        <VercelInstructionCard />
                    </>
                )}
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
    const [tapCount, setTapCount] = useState(0);

    const handleFooterTap = () => {
        setTapCount(prev => prev + 1);
    };

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

            {tapCount >= 7 && <SecretVault />}

            <div className="text-center pt-4 pb-8 select-none cursor-pointer active:scale-95 transition-transform" onClick={handleFooterTap}>
                <p className="text-[8px] font-mono text-slate-700 uppercase tracking-[0.5em] hover:text-slate-600">CoreMaster OS v4.4.0 • Vercel Ready</p>
            </div>
        </div>
    );
};