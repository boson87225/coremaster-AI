
import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { Circle, ChevronDown, CheckCircle } from './icons';

interface ProfileFormProps {
    initialData?: UserProfile | null;
    onSubmit: (profile: UserProfile) => void;
    onCancel?: () => void;
    submitLabel: string;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSubmit, onCancel, submitLabel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        gender: initialData?.gender || 'male',
        age: initialData?.age.toString() || '27',
        weight: initialData?.weight.toString() || '67',
        height: initialData?.height.toString() || '165',
        goal: initialData?.goal || 'MUSCLE_GAIN'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const ageNum = parseInt(formData.age, 10);
        const weightNum = parseFloat(formData.weight);
        const heightNum = parseFloat(formData.height);

        if (formData.name && ageNum > 0 && weightNum > 0 && heightNum > 0) {
            onSubmit({
                name: formData.name,
                gender: formData.gender as 'male' | 'female',
                age: ageNum,
                weight: weightNum,
                height: heightNum,
                goal: formData.goal as UserProfile['goal'],
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 稱呼 */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('YOUR_NAME')}</label>
                <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder={t('YOUR_NAME_PLACEHOLDER')}
                    className="w-full p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-sm font-bold text-white focus:border-cyan-500 outline-none transition-all" 
                    required 
                />
            </div>

            {/* 性別選擇 - 截圖樣式 */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('GENDER')}</label>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, gender: 'male'})}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${formData.gender === 'male' ? 'bg-cyan-500/10 border-cyan-500/60' : 'bg-slate-900/40 border-slate-800'}`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.gender === 'male' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600 bg-white'}`}>
                            {formData.gender === 'male' && <div className="w-2 h-2 rounded-full bg-slate-900"></div>}
                        </div>
                        <span className={`text-lg font-black ${formData.gender === 'male' ? 'text-white' : 'text-slate-500'}`}>{t('MALE')}</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, gender: 'female'})}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${formData.gender === 'female' ? 'bg-cyan-500/10 border-cyan-500/60' : 'bg-slate-900/40 border-slate-800'}`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.gender === 'female' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600 bg-white'}`}>
                            {formData.gender === 'female' && <div className="w-2 h-2 rounded-full bg-slate-900"></div>}
                        </div>
                        <span className={`text-lg font-black ${formData.gender === 'female' ? 'text-white' : 'text-slate-500'}`}>{t('FEMALE')}</span>
                    </button>
                </div>
            </div>

            {/* 數據輸入 - 截圖三欄樣式 */}
            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('AGE')}</label>
                    <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xl font-black text-white text-center focus:border-cyan-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('WEIGHT')}</label>
                    <input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xl font-black text-white text-center focus:border-cyan-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('HEIGHT')}</label>
                    <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xl font-black text-white text-center focus:border-cyan-500 outline-none transition-all" />
                </div>
            </div>

            {/* 目標下拉 - 截圖樣式 */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('PRIMARY_GOAL')}</label>
                <div className="relative">
                    <select 
                        value={formData.goal} 
                        onChange={e => setFormData({...formData, goal: e.target.value as UserProfile['goal']})} 
                        className="w-full p-5 bg-slate-900/60 border border-slate-800 rounded-2xl text-sm font-bold text-white outline-none appearance-none focus:border-cyan-500 transition-all pr-12"
                    >
                        <option value="MUSCLE_GAIN">{t('GOAL_MUSCLE_GAIN')}</option>
                        <option value="FAT_LOSS">{t('GOAL_FAT_LOSS')}</option>
                        <option value="ENDURANCE">{t('GOAL_ENDURANCE')}</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ChevronDown size={20} />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="flex-1 py-4 border border-white/10 rounded-2xl text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all">
                        {t('CANCEL')}
                    </button>
                )}
                <button type="submit" className="flex-[2] py-5 bg-cyan-500 text-slate-950 font-black rounded-[2rem] uppercase tracking-[0.2em] text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    <CheckCircle size={18} />
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};
