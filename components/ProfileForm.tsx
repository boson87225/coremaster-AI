
import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { useTranslation } from '../context/LanguageContext';

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
        age: initialData?.age.toString() || '',
        weight: initialData?.weight.toString() || '',
        height: initialData?.height.toString() || '',
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300">{t('YOUR_NAME')}</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200" required />
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-sm font-medium text-slate-300">{t('AGE')}</label><input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200" required /></div>
                <div><label className="block text-sm font-medium text-slate-300">{t('WEIGHT')}</label><input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200" required /></div>
                <div><label className="block text-sm font-medium text-slate-300">{t('HEIGHT')}</label><input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200" required /></div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300">{t('GENDER')}</label>
                <div className="mt-1 grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setFormData({...formData, gender: 'male'})} className={`p-2 border rounded-md ${formData.gender === 'male' ? 'bg-cyan-500/20 border-cyan-400' : 'bg-slate-700 border-slate-600'}`}>{t('MALE')}</button>
                    <button type="button" onClick={() => setFormData({...formData, gender: 'female'})} className={`p-2 border rounded-md ${formData.gender === 'female' ? 'bg-cyan-500/20 border-cyan-400' : 'bg-slate-700 border-slate-600'}`}>{t('FEMALE')}</button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300">{t('PRIMARY_GOAL')}</label>
                <select value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value as UserProfile['goal']})} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200">
                    <option value="MUSCLE_GAIN">{t('GOAL_MUSCLE_GAIN')}</option>
                    <option value="FAT_LOSS">{t('GOAL_FAT_LOSS')}</option>
                    <option value="ENDURANCE">{t('GOAL_ENDURANCE')}</option>
                </select>
            </div>
            <div className="flex gap-3 pt-2">
                {onCancel && <button type="button" onClick={onCancel} className="flex-1 py-2 bg-slate-600 rounded-full font-bold">{t('CANCEL')}</button>}
                <button type="submit" className="flex-1 py-2 bg-cyan-600 rounded-full font-bold shadow-lg hover:bg-cyan-700">{submitLabel}</button>
            </div>
        </form>
    );
};
