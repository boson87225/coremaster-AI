
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Settings, Trash2, ArrowLeft, BrainCircuit, ShieldCheck, ShieldAlert, Zap, ExternalLink, Loader2, CheckCircle, WifiOff, Terminal, RefreshCw, Edit, FolderLock, Unlock, Copy, X, ShieldCheck as Shield } from './icons';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import { checkHasApiKey, setCustomApiKey, removeCustomApiKey, getEffectiveApiKey } from '../services/geminiService';
import type { Page } from '../page_types'; // 修正 import 路徑或假設 types 已整合

interface SettingsPageProps {
    userId: string | null;
    setPage: (page: any) => void;
}

const KeySecurityGuide: React.FC = () => {
    return (
        <div className="p-5 bg-gradient-to-br from-indigo-900/40 to-slate-900/60 rounded-[2rem] border border-indigo-500/30 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-indigo-400">
                <Shield size={18} />
                <h4 className="font-black text-xs uppercase tracking-widest">如何防止 API Key 被封鎖？</h4>
            </div>
            <div className="space-y-3">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                    Google 會撤銷在 GitHub 上公開曝露的 Key。若要維持 Key 的有效性，請務必完成以下步驟：
                </p>
                <ol className="text-[10px] text-slate-300 space-y-2 list-decimal list-inside font-medium">
                    <li>前往 <a href="https://console.cloud.google.com/" target="_blank" className="text-cyan-400 underline">Google Cloud Console</a></li>
                    <li>進入「API 與服務」 > 「憑證」</li>
                    <li>點擊編輯你的 API Key</li>
                    <li>在「應用程式限制」選擇 <span className="text-white font-bold">「網址參照位址 (HTTP)」</span></li>
                    <li>新增你的 Vercel 網址 (例如 <code className="bg-black/40 px-1">*.vercel.app/*</code>)</li>
                </ol>
                <p className="text-[10px] text-orange-400 italic">
                    * 設定網域限制後，即便 Key 被公開，Google 也不會輕易撤銷它。
                </p>
            </div>
        </div>
    );
};

export const SettingsPage: React.FC<SettingsPageProps> = ({ userId, setPage }) => {
    const { t } = useTranslation();
    const [tapCount, setTapCount] = useState(0);
    const [isLinked, setIsLinked] = useState<boolean>(false);
    const [manualKey, setManualKey] = useState('');
    const [isVercel, setIsVercel] = useState(false);

    useEffect(() => {
        const check = async () => {
            const linked = await checkHasApiKey();
            setIsLinked(linked);
            const key = getEffectiveApiKey();
            if (key) setManualKey(key);
            setIsVercel(window.location.hostname !== 'localhost' && !window.location.hostname.includes('aistudio'));
        };
        check();
    }, []);

    const handleSaveKey = () => {
        if (manualKey.trim().length > 20) {
            setCustomApiKey(manualKey);
            setIsLinked(true);
            alert("API Key 已更新並儲存於瀏覽器。");
        }
    };

    const handleClearKey = () => {
        if (confirm("確定移除自定義金鑰？")) {
            removeCustomApiKey();
            setManualKey('');
            setIsLinked(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <header className="flex items-center justify-between px-2">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Settings</h1>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] font-bold mt-2">Security & Identity</p>
                </div>
                <button onClick={() => setPage('home')} className="w-10 h-10 rounded-2xl glass flex items-center justify-center border border-white/10">
                    <ArrowLeft size={18} className="text-slate-400" />
                </button>
            </header>
            
            <div className="p-6 glass rounded-[2.5rem] border border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isLinked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {isLinked ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">API 核心狀態</h3>
                            <p className={`text-[10px] font-bold uppercase ${isLinked ? 'text-emerald-500' : 'text-red-500'}`}>
                                {isLinked ? 'Neural Link Active' : 'Neural Link Offline'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <input 
                            type="password" 
                            value={manualKey}
                            onChange={(e) => setManualKey(e.target.value)}
                            placeholder="貼上新的 API Key (AIza...)"
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-500 transition-all"
                        />
                        <button 
                            onClick={handleSaveKey}
                            className="absolute right-2 top-2 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-[10px] rounded-xl uppercase transition-all"
                        >
                            更新
                        </button>
                    </div>
                    {isLinked && (
                        <button onClick={handleClearKey} className="text-[10px] text-red-400 flex items-center gap-1 hover:underline ml-1">
                            <Trash2 size={10} /> 移除當前金鑰
                        </button>
                    )}
                </div>
            </div>

            <KeySecurityGuide />

            <div className="p-5 glass rounded-[2.5rem] border border-white/10">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">系統管理</h3>
                 <button
                    onClick={() => { if(confirm("確定清除所有訓練紀錄？")) localStorage.clear(); window.location.reload(); }}
                    className="w-full py-3 bg-red-600/10 text-red-500 font-black text-xs rounded-xl border border-red-500/20 hover:bg-red-600/20 transition-all uppercase tracking-widest"
                >
                    清除快取並重設 App
                </button>
            </div>

            <div className="text-center pt-4 pb-8 select-none" onClick={() => setTapCount(c => c + 1)}>
                <p className="text-[8px] font-mono text-slate-700 uppercase tracking-[0.5em]">CoreMaster OS v4.5.2 • Security Hardened</p>
            </div>
        </div>
    );
};
