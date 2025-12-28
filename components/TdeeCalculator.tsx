
import React, { useState, useContext } from 'react';
import { Calculator, Circle } from './icons';
import { useTranslation } from '../context/LanguageContext';
import { PlanContext } from '../context/PlanContext';

interface TdeeCalculatorProps {
    onTdeeCalculated: (tdee: number) => void;
}

export const TdeeCalculator: React.FC<TdeeCalculatorProps> = ({ onTdeeCalculated }) => {
    const { t } = useTranslation();
    const { userProfile } = useContext(PlanContext);
    
    const activityLevels = [
        { value: 1.2, label: t('ACTIVITY_LEVEL_1') },
        { value: 1.375, label: t('ACTIVITY_LEVEL_2') },
        { value: 1.55, label: t('ACTIVITY_LEVEL_3') },
        { value: 1.725, label: t('ACTIVITY_LEVEL_4') },
        { value: 1.9, label: t('ACTIVITY_LEVEL_5') },
    ];

    const [gender, setGender] = useState(userProfile?.gender || 'male');
    const [age, setAge] = useState(userProfile?.age.toString() || '');
    const [weight, setWeight] = useState(userProfile?.weight.toString() || '');
    const [height, setHeight] = useState(userProfile?.height.toString() || '');
    const [activityLevel, setActivityLevel] = useState(1.375);
    const [error, setError] = useState<string | null>(null);
    
     const calculateTdee = (e: React.FormEvent) => {
        e.preventDefault();
        const ageNum = parseInt(age, 10);
        const weightNum = parseFloat(weight);
        const heightNum = parseFloat(height);

        if (isNaN(ageNum) || isNaN(weightNum) || isNaN(heightNum) || ageNum <= 0 || weightNum <= 0 || heightNum <= 0) {
            setError(t('TDEE_ERROR_INVALID_INPUT'));
            return;
        }
        setError(null);
        
        let calculatedBmr;
        if (gender === 'male') {
            calculatedBmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
        } else {
            calculatedBmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
        }
        
        const calculatedTdee = calculatedBmr * activityLevel;
        onTdeeCalculated(calculatedTdee);
    };

    return (
        <div className="space-y-6 animate-fade-in text-slate-200">
            <form onSubmit={calculateTdee} className="space-y-6">
                {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-xl text-xs font-bold">{error}</p>}
                
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-400 block px-1">{t('GENDER')}</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            type="button"
                            onClick={() => setGender('male')}
                            className={`flex items-center justify-start gap-4 p-5 rounded-[1.5rem] border-2 transition-all group ${gender === 'male' ? 'bg-cyan-500/10 border-cyan-500' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'}`}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${gender === 'male' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`}>
                                {gender === 'male' && <div className="w-2 h-2 rounded-full bg-slate-900"></div>}
                            </div>
                            <span className={`text-lg font-black uppercase tracking-tighter ${gender === 'male' ? 'text-white' : 'text-slate-500'}`}>{t('MALE')}</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setGender('female')}
                            className={`flex items-center justify-start gap-4 p-5 rounded-[1.5rem] border-2 transition-all group ${gender === 'female' ? 'bg-cyan-500/10 border-cyan-500' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'}`}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${gender === 'female' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`}>
                                {gender === 'female' && <div className="w-2 h-2 rounded-full bg-slate-900"></div>}
                            </div>
                            <span className={`text-lg font-black uppercase tracking-tighter ${gender === 'female' ? 'text-white' : 'text-slate-500'}`}>{t('FEMALE')}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{t('AGE')}</label>
                        <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full p-4 bg-slate-800/60 border-2 border-slate-700/50 rounded-2xl text-xl font-black text-white outline-none focus:border-cyan-500 transition-all text-center" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{t('WEIGHT')}</label>
                        <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-4 bg-slate-800/60 border-2 border-slate-700/50 rounded-2xl text-xl font-black text-white outline-none focus:border-cyan-500 transition-all text-center" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{t('HEIGHT')}</label>
                        <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full p-4 bg-slate-800/60 border-2 border-slate-700/50 rounded-2xl text-xl font-black text-white outline-none focus:border-cyan-500 transition-all text-center" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{t('ACTIVITY_LEVEL')}</label>
                    <div className="relative">
                        <select 
                            value={activityLevel} 
                            onChange={e => setActivityLevel(Number(e.target.value))} 
                            className="w-full p-5 bg-slate-800/60 border-2 border-slate-700/50 rounded-2xl text-sm font-bold text-white outline-none focus:border-cyan-500 transition-all appearance-none pr-10"
                        >
                            {activityLevels.map(level => (
                                <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                            <Circle size={8} className="fill-current" />
                        </div>
                    </div>
                </div>

                <button type="submit" className="w-full py-5 bg-cyan-500 text-slate-950 font-black rounded-3xl uppercase tracking-[0.2em] text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    <Calculator size={18} />
                    {t('CALCULATE_TDEE_BUTTON')}
                </button>
            </form>
        </div>
    );
};
