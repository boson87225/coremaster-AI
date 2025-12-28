
import React, { useContext, useState, useEffect } from 'react';
// Fixed: removed non-existent 'Shield' import from './icons'
import { Settings, Trash2, ArrowLeft, ShieldCheck, ShieldAlert, Loader2, Terminal, Key, X, CheckCircle, Flame } from './icons';
import { useTranslation } from '../context/LanguageContext';
import { checkHasApiKey, setCustomApiKey, removeCustomApiKey, getEffectiveApiKey } from '../services/geminiService';
import type { Page } from '../types';

interface SettingsPageProps {
    userId: string | null;
    setPage: (page: any) => void;
}

const SecretTerminal: React.FC<{ onClose: () => void, onSave: (key: string) => void }> = ({ onClose, onSave }) => {
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAccess = () => {
        if (!inputValue.startsWith('AIza')) {
            alert("ACCESS DENIED: Invalid Key Format.");
            return;
        }
        setIsProcessing(true);
        setTimeout(() => {
            onSave(inputValue);
            setIsProcessing(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 animate-fade-in font-mono">
            <div className="w-full max-w-sm p-6 border border-emerald-500/30 rounded-lg bg-black shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
                {/* 掃描線效果 */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 opacity-30"></div>
                
                <div className="flex justify-between items-center mb-6 border-b border-emerald-500/20 pb-2">
                    <h3 className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Terminal size={14} /> System Override Mode
                    </h3>
                    <button onClick={onClose} className="text-emerald-800 hover:text-emerald-400"><X size={18} /></button>
                </div>

                <div className="space-y-4 relative z-20">
                    <p className="text-[10px] text-emerald-600 leading-tight">
                        COREMASTER OS v4.5.2<br/>
                        KERNEL: SECURE_INJECT_V2<br/>
                        STATUS: AWAITING_NEURAL_LINK_KEY...
                    </p>
                    
                    <div className="space-y-2">
                        <label className="text-[9px] text-emerald-700 uppercase">Input Key:</label>
                        <input 
                            type="password"
                            autoFocus
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="AIza..."
                            className="w-full bg-emerald-950/20 border border-emerald-500/30 rounded p-2 text-xs text-emerald-400 outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-900"
                        />
                    </div>

                    <button 
                        onClick={handleAccess}
                        disabled={isProcessing}
                        className="w-full py-2 bg-emerald-600 text-black font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50"
                    >
                        {isProcessing ? 'INJECTING...' : 'ESTABLISH LINK'}
                    </button>
                    
                    <p className="text-[8px] text-emerald-900 text-center italic">
                        * Key will be localized in secure storage. No cloud exposure.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const SettingsPage: React.FC<SettingsPageProps> = ({ userId, setPage }) => {
    const { t } = useTranslation();
    const [tapCount, setTapCount] = useState(0);
    const [showTerminal, setShowTerminal] = useState(false);
    const [isLinked, setIsLinked] = useState<boolean>(false);
    const [currentKey, setCurrentKey] = useState('');

    useEffect(() => {
        const check = async () => {
            const linked = await checkHasApiKey();
            setIsLinked(linked);
            setCurrentKey(getEffectiveApiKey());
        };
        check();
    }, []);

    const handleTap = () => {
        setTapCount(prev => {
            const next = prev + 1;
            if (next >= 7) {
                setShowTerminal(true);
                return 0;
            }
            return next;
        });
        // 3秒後自動重置點擊計數
        const timer = setTimeout(() => setTapCount(0), 3000);
        return () => clearTimeout(timer);
    };

    const saveKey = (key: string) => {
        setCustomApiKey(key);
        setIsLinked(true);
        setCurrentKey(key);
    };

    const clearKey = () => {
        if (confirm("確定斷開 Neural Link？這將移除自定義 API Key。")) {
            removeCustomApiKey();
            setIsLinked(false);
            setCurrentKey('');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {showTerminal && <SecretTerminal onClose={() => setShowTerminal(false)} onSave={saveKey} />}

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
                        <div className={`p-2 rounded-xl ${isLinked ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-red-500/20 text-red-400'}`}>
                            {isLinked ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Neural Link</h3>
                            <p className={`text-[10px] font-bold uppercase ${isLinked ? 'text-emerald-500' : 'text-red-500'}`}>
                                {isLinked ? 'Protocol Active' : 'Protocol Disconnected'}
                            </p>
                        </div>
                    </div>
                </div>

                {isLinked ? (
                    <div className="space-y-3 animate-fade-in">
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Key size={14} className="text-slate-600" />
                                <span className="text-xs font-mono text-slate-400">AIza...{currentKey.slice(-4)}</span>
                            </div>
                            <button onClick={clearKey} className="text-[10px] text-red-500 font-bold uppercase hover:underline flex items-center gap-1">
                                <Trash2 size={12} /> Disconnect
                            </button>
                        </div>
                        <p className="text-[9px] text-slate-500 px-1 italic">
                            * 已透過本地端手動注入金鑰，AI 功能運作中。
                        </p>
                    </div>
                ) : (
                    <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl text-center space-y-2 animate-pulse">
                        <p className="text-[11px] text-orange-400 font-medium leading-relaxed px-4">
                            AI 核心未連線。請諮詢系統管理員獲取 Neural Link 授權。
                        </p>
                    </div>
                )}
            </div>

            <div className="p-5 glass rounded-[2.5rem] border border-white/10 space-y-4">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">系統維護</h3>
                 <button
                    onClick={() => { if(confirm("確定清除所有紀錄？")) { localStorage.clear(); window.location.reload(); } }}
                    className="w-full py-3 bg-red-600/10 text-red-500 font-black text-xs rounded-xl border border-red-500/20 hover:bg-red-600/20 transition-all uppercase tracking-widest"
                >
                    清除快取並重設系統
                </button>
            </div>

            <div 
                className="text-center pt-10 pb-4 select-none cursor-pointer group" 
                onClick={handleTap}
            >
                <p className="text-[8px] font-mono text-slate-700 uppercase tracking-[0.5em] group-active:text-emerald-500 transition-colors">
                    CoreMaster OS v4.5.2 • Security Hardened
                </p>
                {tapCount > 0 && (
                    <div className="flex justify-center gap-1 mt-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className={`w-1 h-1 rounded-full ${i < tapCount ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
