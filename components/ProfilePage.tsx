
import React, { useContext, useState, useEffect } from 'react';
import { User, ClipboardList, Share2, QrCode, Settings, Dumbbell, Activity, Target as GoalIcon, Edit } from './icons';
import type { Page, UserProfile } from '../types';
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
    const { activeWorkoutPlan, userProfile, setUserProfile } = useContext(PlanContext);
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        name: userProfile?.name || '',
        gender: userProfile?.gender || 'male',
        age: userProfile?.age.toString() || '',
        weight: userProfile?.weight.toString() || '',
        height: userProfile?.height.toString() || '',
        goal: userProfile?.goal || 'MUSCLE_GAIN'
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name,
                gender: userProfile.gender,
                age: userProfile.age.toString(),
                weight: userProfile.weight.toString(),
                height: userProfile.height.toString(),
                goal: userProfile.goal,
            });
        }
    }, [userProfile]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const ageNum = parseInt(formData.age, 10);
        const weightNum = parseFloat(formData.weight);
        const heightNum = parseFloat(formData.height);

        if (formData.name && ageNum > 0 && weightNum > 0 && heightNum > 0) {
            setUserProfile({
                name: formData.name,
                gender: formData.gender as 'male' | 'female',
                age: ageNum,
                weight: weightNum,
                height: heightNum,
                goal: formData.goal as UserProfile['goal'],
            });
            setIsEditing(false);
        } else {
            alert("Please fill in all fields with valid information.");
        }
    };
    
    return (
        <section className="p-4 md:p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                 <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center border-2 border-slate-600">
                    <User className="w-10 h-10 text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">{userProfile?.name || t('PROFILE_TITLE')}</h1>
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
            
            {userProfile && (
                 <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-bold text-slate-200">{isEditing ? t('EDIT_PROFILE_TITLE') : t('YOUR_NAME')}</h3>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full">
                                <Edit size={14} /> {t('EDIT')}
                            </button>
                        )}
                    </div>
                    {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-4 animate-fade-in">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300">{t('YOUR_NAME')}</label>
                                <input id="name" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md" required />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div><label htmlFor="age" className="block text-sm font-medium text-slate-300">{t('AGE')}</label><input id="age" type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md" required /></div>
                                <div><label htmlFor="weight" className="block text-sm font-medium text-slate-300">{t('WEIGHT')}</label><input id="weight" type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md" required /></div>
                                <div><label htmlFor="height" className="block text-sm font-medium text-slate-300">{t('HEIGHT')}</label><input id="height" type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md" required /></div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300">{t('GENDER')}</label>
                                <div className="mt-1 grid grid-cols-2 gap-3"><label className={`flex items-center p-3 border rounded-md cursor-pointer ${formData.gender === 'male' ? 'bg-cyan-500/10 border-cyan-400/50' : 'bg-slate-700/50 border-slate-600'}`}><input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={() => setFormData({...formData, gender: 'male'})} className="h-4 w-4 text-cyan-500 bg-slate-600 border-slate-500 focus:ring-cyan-500" /><span className="ml-3 font-medium text-slate-200">{t('MALE')}</span></label><label className={`flex items-center p-3 border rounded-md cursor-pointer ${formData.gender === 'female' ? 'bg-cyan-500/10 border-cyan-400/50' : 'bg-slate-700/50 border-slate-600'}`}><input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={() => setFormData({...formData, gender: 'female'})} className="h-4 w-4 text-cyan-500 bg-slate-600 border-slate-500 focus:ring-cyan-500" /><span className="ml-3 font-medium text-slate-200">{t('FEMALE')}</span></label></div>
                            </div>
                             <div>
                                <label htmlFor="goal" className="block text-sm font-medium text-slate-300">{t('PRIMARY_GOAL')}</label>
                                <select id="goal" value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value as UserProfile['goal']})} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md"><option value="MUSCLE_GAIN">{t('GOAL_MUSCLE_GAIN')}</option><option value="FAT_LOSS">{t('GOAL_FAT_LOSS')}</option><option value="ENDURANCE">{t('GOAL_ENDURANCE')}</option></select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 px-4 bg-slate-600 text-white font-semibold rounded-full hover:bg-slate-700 transition">{t('CANCEL')}</button>
                                <button type="submit" className="flex-1 py-2 px-4 bg-cyan-600 text-white font-semibold rounded-full hover:bg-cyan-700 transition">{t('SAVE_CHANGES')}</button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-700/50 p-3 rounded-lg text-center"><p className="text-xs text-slate-400">{t('AGE')}</p><p className="text-lg font-bold text-slate-200">{userProfile.age}</p></div>
                            <div className="bg-slate-700/50 p-3 rounded-lg text-center"><p className="text-xs text-slate-400">{t('GENDER')}</p><p className="text-lg font-bold text-slate-200">{t(userProfile.gender.toUpperCase() as any)}</p></div>
                            <div className="bg-slate-700/50 p-3 rounded-lg text-center"><p className="text-xs text-slate-400">{t('WEIGHT')}</p><p className="text-lg font-bold text-slate-200">{userProfile.weight} {t('WEIGHT_UNIT')}</p></div>
                            <div className="bg-slate-700/50 p-3 rounded-lg text-center"><p className="text-xs text-slate-400">{t('HEIGHT')}</p><p className="text-lg font-bold text-slate-200">{userProfile.height} {t('HEIGHT_UNIT')}</p></div>
                            <div className="bg-slate-700/50 p-3 rounded-lg text-center col-span-2"><p className="text-xs text-slate-400">{t('GOAL')}</p><p className="text-lg font-bold text-slate-200">{t(`GOAL_${userProfile.goal}`)}</p></div>
                        </div>
                    )}
                </div>
            )}
            
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