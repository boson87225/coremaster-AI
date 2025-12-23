
import React, { useContext, useState } from 'react';
import { User, ClipboardList, Share2, QrCode, Settings, Edit } from './icons';
import type { Page } from '../types';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import { QrCodeModal } from './QrCodeModal';
import { ProfileForm } from './ProfileForm';

export const ProfilePage: React.FC<{ userId: string | null; setPage: (page: Page) => void; }> = ({ userId, setPage }) => {
    const { activeWorkoutPlan, userProfile, setUserProfile } = useContext(PlanContext);
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);

    return (
        <section className="p-4 md:p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                 <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center border-2 border-slate-600">
                    <User className="w-10 h-10 text-cyan-400" />
                </div>
                <div className="flex-grow">
                    <h1 className="text-2xl font-bold text-white">{userProfile?.name || t('PROFILE_TITLE')}</h1>
                    <p className="text-xs text-slate-500 font-mono truncate max-w-[150px]">{userId || t('ANONYMOUS_USER')}</p>
                </div>
                <button onClick={() => setPage('settings')} className="p-2 text-slate-400 hover:text-cyan-400"><Settings size={20}/></button>
            </div>
            
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-200">{isEditing ? t('EDIT_PROFILE_TITLE') : t('YOUR_NAME')}</h3>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-sm text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full"><Edit size={14} /> {t('EDIT')}</button>
                    )}
                </div>
                {isEditing ? (
                    <ProfileForm 
                        initialData={userProfile}
                        submitLabel={t('SAVE_CHANGES')}
                        onCancel={() => setIsEditing(false)}
                        onSubmit={(p) => { setUserProfile(p); setIsEditing(false); }}
                    />
                ) : userProfile && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-700/50 p-3 rounded-lg text-center"><p className="text-xs text-slate-400">{t('AGE')}</p><p className="text-lg font-bold">{userProfile.age}</p></div>
                        <div className="bg-slate-700/50 p-3 rounded-lg text-center"><p className="text-xs text-slate-400">{t('GENDER')}</p><p className="text-lg font-bold">{t(userProfile.gender.toUpperCase() as any)}</p></div>
                        <div className="bg-slate-700/50 p-3 rounded-lg text-center"><p className="text-xs text-slate-400">{t('WEIGHT')}</p><p className="text-lg font-bold">{userProfile.weight} kg</p></div>
                        <div className="bg-slate-700/50 p-3 rounded-lg text-center"><p className="text-xs text-slate-400">{t('HEIGHT')}</p><p className="text-lg font-bold">{userProfile.height} cm</p></div>
                        <div className="bg-slate-700/50 p-3 rounded-lg text-center col-span-2"><p className="text-xs text-slate-400">{t('GOAL')}</p><p className="text-lg font-bold">{t(`GOAL_${userProfile.goal}`)}</p></div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <ClipboardList className="text-cyan-400" />
                    <span className="font-bold text-slate-200">{activeWorkoutPlan ? activeWorkoutPlan.planTitle : t('NO_PLAN_SET_TITLE')}</span>
                </div>
                <button onClick={() => setPage('my_plan')} className="text-cyan-400 hover:underline text-sm">{t('VIEW_PLAN_BUTTON')}</button>
            </div>

            <div className="flex gap-3">
                <button onClick={() => setShowQrModal(true)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-700 rounded-full font-bold"><QrCode size={18}/> {t('SHOW_QR_CODE_BUTTON')}</button>
                <button onClick={() => navigator.share?.({url: window.location.href})} className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-600 rounded-full font-bold"><Share2 size={18}/> {t('SHARE_WITH_FRIENDS_BUTTON')}</button>
            </div>
            {showQrModal && <QrCodeModal url={window.location.href} onClose={() => setShowQrModal(false)} />}
        </section>
    );
};
