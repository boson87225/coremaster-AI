
import React, { useState } from 'react';
import { Calculator } from './icons';
import { useTranslation } from '../context/LanguageContext';

interface TdeeCalculatorProps {
    onTdeeCalculated: (tdee: number) => void;
}

export const TdeeCalculator: React.FC<TdeeCalculatorProps> = ({ onTdeeCalculated }) => {
    const { t } = useTranslation();
    const activityLevels = [
        { value: 1.2, label: t('ACTIVITY_LEVEL_1') },
        { value: 1.375, label: t('ACTIVITY_LEVEL_2') },
        { value: 1.55, label: t('ACTIVITY_LEVEL_3') },
        { value: 1.725, label: t('ACTIVITY_LEVEL_4') },
        { value: 1.9, label: t('ACTIVITY_LEVEL_5') },
    ];
    // State for the calculator
    const [gender, setGender] = useState('male');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [activityLevel, setActivityLevel] = useState(1.375); // Default to lightly active
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
        <div className="space-y-6 animate-fade-in">
            <form onSubmit={calculateTdee} className="space-y-4">
                {error && <p className="text-red-400 bg-red-500/10 p-2 rounded-md text-sm">{error}</p>}
                
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

                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-slate-300">{t('AGE')}</label>
                        <input id="age" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder={t('AGE_UNIT')} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-200" />
                    </div>
                    <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-slate-300">{t('WEIGHT')}</label>
                        <input id="weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={t('WEIGHT_UNIT')} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-200" />
                    </div>
                    <div>
                        <label htmlFor="height" className="block text-sm font-medium text-slate-300">{t('HEIGHT')}</label>
                        <input id="height" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder={t('HEIGHT_UNIT')} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-200" />
                    </div>
                </div>

                <div>
                    <label htmlFor="activity" className="block text-sm font-medium text-slate-300">{t('ACTIVITY_LEVEL')}</label>
                    <select id="activity" value={activityLevel} onChange={e => setActivityLevel(Number(e.target.value))} className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-200">
                        {activityLevels.map(level => (
                            <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 transition">
                    <Calculator className="w-5 h-5" />
                    {t('CALCULATE_TDEE_BUTTON')}
                </button>
            </form>
        </div>
    );
};