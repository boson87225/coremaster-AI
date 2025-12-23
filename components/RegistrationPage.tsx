
import React, { useContext } from 'react';
import { Dumbbell } from './icons';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import { ProfileForm } from './ProfileForm';

export const RegistrationPage: React.FC = () => {
  const { setUserProfile } = useContext(PlanContext);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md p-6 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-6">
        <div className="text-center">
            <Dumbbell className="w-12 h-12 text-cyan-400 mx-auto mb-2"/>
            <h1 className="text-2xl font-bold text-white">{t('REG_TITLE')}</h1>
            <p className="text-slate-400 mt-1">{t('REG_SUBTITLE')}</p>
        </div>
        <ProfileForm 
            submitLabel={t('REG_SUBMIT_BUTTON')}
            onSubmit={setUserProfile}
        />
      </div>
    </div>
  );
};
