
import React, { useContext, useState } from 'react';
import { User, ClipboardList, Share2, QrCode, Settings } from './icons';
import type { Page } from '../types';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import { QrCodeModal } from './QrCodeModal';

interface ProfilePageProps {
    userId: string | null;
    setPage: (page: Page) => void;
}

const ShareSection: React.FC = () => {
    const { t } = useTranslation();
    const [showQrModal, setShowQrModal] = useState(false);
    const [copyButtonText, setCopyButtonText] = useState(t('SHARE_WITH_FRIENDS_BUTTON'));
    
    const shareUrl = `${window.location.origin}${window.location.pathname || ''}`;

    const handleShare = async () => {
        const shareData = {
            title: t('SHARE_SHEET_TITLE'),
            text: t('SHARE_SHEET_TEXT'),
            url: shareUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopyButtonText(t('LINK_COPIED'));
                setTimeout(() => setCopyButtonText(t('SHARE_WITH_FRIENDS_BUTTON')), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                alert('Could not copy link to clipboard.');
            }
        }
    };

    return (
        <>
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-3">
                <h3 className="text-lg font-bold text-slate-200">{t('SHARE_APP_TITLE')}</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-cyan-600 text-white font-semibold rounded-full hover:bg-cyan-700 transition"
                    >
                        <Share2 size={18} /> {copyButtonText}
                    </button>
                    <button
                        onClick={() => setShowQrModal(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-slate-700 text-slate-200 font-semibold rounded-full hover:bg-slate-600 transition"
                    >
                        <QrCode size={18} /> {t('SHOW_QR_CODE_BUTTON')}
                    </button>
                </div>
            </div>
            {showQrModal && <QrCodeModal url={shareUrl} onClose={() => setShowQrModal(false)} />}
        </>
    );
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ userId, setPage }) => {
    const { activeWorkoutPlan } = useContext(PlanContext);
    const { t } = useTranslation();
    
    return (
        <section className="p-4 md:p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                 <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center border-2 border-slate-600">
                    <User className="w-10 h-10 text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">{t('PROFILE_TITLE')}</h1>
                    <p className="text-sm text-slate-400 font-mono break-all">{userId || t('ANONYMOUS_USER')}</p>
                </div>
            </div>

            <button
                onClick={() => setPage('settings')}
                className="w-full flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700 hover:bg-slate-700/50 transition"
            >
                <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-cyan-400" />
                    <span className="text-lg font-bold text-slate-200">{t('SETTINGS')}</span>
                </div>
                <span className="text-sm text-slate-400">{'>'}</span>
            </button>
            
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-3">
                <div className="flex items-center gap-3">
                     <div className="p-2 bg-cyan-500/10 rounded-full"><ClipboardList className="w-5 h-5 text-cyan-400" /></div>
                    <h3 className="text-lg font-bold text-slate-200">{t('CURRENT_PLAN_TITLE')}</h3>
                </div>
                {activeWorkoutPlan ? (
                    <div>
                        <p className="font-semibold text-slate-300">{activeWorkoutPlan.planTitle}</p>
                        <div className="flex gap-2 mt-2">
                             <button onClick={() => setPage('my_plan')} className="text-sm text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full hover:bg-cyan-500/20">
                                {t('VIEW_PLAN_BUTTON')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 text-center py-2">
                        {t('NO_PLAN_SET_PROFILE_DESC_1')} <button onClick={() => setPage('ai_planner')} className="font-bold text-cyan-400 hover:underline">{t('NO_PLAN_SET_PROFILE_DESC_2')}</button> {t('NO_PLAN_SET_PROFILE_DESC_3')}
                    </p>
                )}
            </div>

            <ShareSection />
            
        </section>
    );
};
