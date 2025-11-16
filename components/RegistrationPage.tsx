import React, { useState, useContext } from 'react';
import { Dumbbell, User } from './icons';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import type { UserProfile } from '../types';

export const RegistrationPage: React.FC = () => {
  const { setUserProfile } = useContext(PlanContext);
  const { t } = useTranslation();
  
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('增肌');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (name && ageNum > 0 && weightNum > 0 && heightNum > 0) {
      const profile: UserProfile = {
        name,
        gender,
        age: ageNum,
        weight: weightNum,
        height: heightNum,
        goal,
      };
      setUserProfile(profile);
    } else {
      alert("Please fill in all fields with valid information.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md p-6 md:p-8 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl space-y-6">
        <div className="text-center">
            <Dumbbell className="w-12 h-12 text-cyan-400 mx-auto mb-2"/>
            <h1 className="text-2xl font-bold text-white">{t('REG_TITLE')}</h1>
            <p className="text-slate-400 mt-1">{t('REG_SUBTITLE')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300">{t('YOUR_NAME')}</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('YOUR_NAME_PLACEHOLDER')} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-200" required />
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-slate-300">{t('AGE')}</label>
                    <input id="age" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder={t('AGE_UNIT')} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-200" required />
                </div>
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-slate-300">{t('WEIGHT')}</label>
                    <input id="weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={t('WEIGHT_UNIT')} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-200" required />
                </div>
                <div>
                    <label htmlFor="height" className="block text-sm font-medium text-slate-300">{t('HEIGHT')}</label>
                    <input id="height" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder={t('HEIGHT_UNIT')} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-200" required />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300">{t('GENDER')}</label>
                <div className="mt-1 grid grid-cols-2 gap-3">
                    <label className={`flex items-center p-3 border rounded-md cursor-pointer ${gender === 'male' ? 'bg-cyan-500/10 border-cyan-400/50' : 'bg-slate-700/50 border-slate-600'}`}>
                        <input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={() => setGender('male')} className="h-4 w-4 text-cyan-500 bg-slate-600 border-slate-500 focus:ring-cyan-500" />
                        <span className="ml-3 font-medium text-slate-200">{t('MALE')}</span>
                    </label>
                    <label className={`flex items-center p-3 border rounded-md cursor-pointer ${gender === 'female' ? 'bg-cyan-500/10 border-cyan-400/50' : 'bg-slate-700/50 border-slate-600'}`}>
                        <input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={() => setGender('female')} className="h-4 w-4 text-cyan-500 bg-slate-600 border-slate-500 focus:ring-cyan-500" />
                        <span className="ml-3 font-medium text-slate-200">{t('FEMALE')}</span>
                    </label>
                </div>
            </div>
            
            <div>
                <label htmlFor="goal" className="block text-sm font-medium text-slate-300">{t('PRIMARY_GOAL')}</label>
                <select id="goal" value={goal} onChange={e => setGoal(e.target.value)} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-200 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="增肌">{t('GOAL_MUSCLE_GAIN')}</option>
                    <option value="減脂">{t('GOAL_FAT_LOSS')}</option>
                    <option value="提升耐力">{t('GOAL_ENDURANCE')}</option>
                </select>
            </div>

            <button type="submit" className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 transition transform hover:scale-[1.02]">
                {t('REG_SUBMIT_BUTTON')}
            </button>
        </form>
      </div>
    </div>
  );
};
