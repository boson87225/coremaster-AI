import React, { useContext, useState, useEffect, useCallback } from 'react';
import { User, ClipboardList, Share2, QrCode, Settings, Edit, BrainCircuit, ShieldCheck, ShieldAlert, ExternalLink, Loader2 } from './icons';
import type { Page } from '../types';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import { QrCodeModal } from './QrCodeModal';
import { ProfileForm } from './ProfileForm';

const AiStatusCard: React.FC = () => {
    const { t } = useTranslation();
    const [hasKey, setHasKey] = useState<boolean | null>(null);
    const [isSettingUp, setIsSettingUp] = useState(false);

    const checkKey = useCallback(async () => {
        if (typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey) {
            const result = await (window as any).aistudio.hasSelectedApiKey();
            setHasKey(result);
        } else {
            setHasKey(!!process.env.API_KEY);
        }
    }, []);

    useEffect(() => {
        checkKey();
    }, [checkKey]);

    const handleSetup = async () => {
        if (isSettingUp) return;
        setIsSettingUp(true);
        try {
            if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
                await (window as any).aistudio.openSelectKey();
                // 樂觀更新
                setHasKey(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSettingUp(false);
        }
    };

    return (
        <div className="p-5 glass rounded-[2rem] border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <BrainCircuit size={18} className="text-cyan-400" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">AI Core Status</h3>
                </div>
                {hasKey ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase">Linked</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">
                        <ShieldAlert size={10} className="text-orange-400" />
                        <span className="text-[10px] font-black text-orange-400 uppercase">Action Required</span>
                    </div>
                )}
            </div>

            {!hasKey && (
                <div className="space-y-3">
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        手機端 AI 功能需要您手動連結一個具備付費權限的 Google Cloud 專案 API 金鑰。
                    </p>
                    <button 
                        onClick={handleSetup}
                        disabled={isSettingUp}
                        className={`w-full py-3 font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            isSettingUp 
                            ? 'bg-slate-700 text-slate-400' 
                            : 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                        }`}
                    >
                        {isSettingUp ? (
                            <>Connecting... <Loader2 size={12} className="animate-spin" /></>
                        ) : (
                            <>Initialize AI Core <ExternalLink size={12} /></>
                        )}
                    </button>
                    <a 
                        href="https://ai.google.dev/gemini-api/docs/billing" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[9px] text-slate-500 hover:text-cyan-400 transition-colors block text-center underline"
                    >
                        Learn about Gemini Billing Requirements
                    </a>
                </div>
            )}
        </div>
    );
};

export const ProfilePage: React.FC<{ userId: string | null; setPage: (page: Page) => void; }> = ({ userId, setPage }) => {
    const { activeWorkoutPlan, userProfile, setUserProfile } = useContext(PlanContext);
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);

    return (
        <section className="space-y-8 animate-fade-in pb-10">
            <header className="flex justify-between items-center">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Profile</h1>
                <button onClick={() => setPage('settings')} className="w-10 h-10 rounded-2xl glass flex items-center justify-center border border-white/10 hover:border-cyan-500 transition-colors">
                    <Settings size={20} className="text-slate-400" />
                </button>
            </header>

            <div className="flex items-center gap-5 glass p-6 rounded-[2.5rem] border border-white/10">
                 <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
                    <User className="w-10 h-10 text-white" />
                </div>
                <div className="flex-grow">
                    <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">{userProfile?.name || t('PROFILE_TITLE')}</h2>
                    <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest truncate max-w-[150px]">{userId || t('ANONYMOUS_USER')}</p>
                </div>
                <button onClick={() => setIsEditing(true)} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors border border-white/5">
                    <Edit size={18}/>
                </button>
            </div>
            
            <AiStatusCard />

            <div className="glass p-8 rounded-[3rem] border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                <div className="flex justify-between items-center mb-6 relative">
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{isEditing ? t('EDIT_PROFILE_TITLE') : 'Biometrics'}</h3>
                </div>
                
                {isEditing ? (
                    <ProfileForm 
                        initialData={userProfile}
                        submitLabel={t('SAVE_CHANGES')}
                        onCancel={() => setIsEditing(false)}
                        onSubmit={(p) => { setUserProfile(p); setIsEditing(false); }}
                    />
                ) : userProfile && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{t('AGE')}</p>
                            <p className="text-xl font-black text-white">{userProfile.age}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{t('GENDER')}</p>
                            <p className="text-xl font-black text-white">{t(userProfile.gender.toUpperCase() as any)}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{t('WEIGHT')}</p>
                            <p className="text-xl font-black text-white">{userProfile.weight} <span className="text-xs text-slate-500">KG</span></p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{t('HEIGHT')}</p>
                            <p className="text-xl font-black text-white">{userProfile.height} <span className="text-xs text-slate-500">CM</span></p>
                        </div>
                        <div className="bg-white/5 p-5 rounded-3xl border border-white/5 col-span-2">
                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{t('GOAL')}</p>
                            <p className="text-xl font-black text-cyan-400 uppercase tracking-tighter">{t(`GOAL_${userProfile.goal}`)}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4 px-2">
                <button onClick={() => setShowQrModal(true)} className="flex-1 flex items-center justify-center gap-3 py-5 glass border border-white/10 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-colors">
                    <QrCode size={18}/> {t('SHOW_QR_CODE_BUTTON')}
                </button>
                <button onClick={() => navigator.share?.({url: window.location.href})} className="flex-1 flex items-center justify-center gap-3 py-5 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform shadow-xl">
                    <Share2 size={18}/> {t('SHARE_WITH_FRIENDS_BUTTON')}
                </button>
            </div>
            {showQrModal && <QrCodeModal url={window.location.href} onClose={() => setShowQrModal(false)} />}
        </section>
    );
};