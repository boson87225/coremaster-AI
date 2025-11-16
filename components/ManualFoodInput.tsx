
import React, { useState } from 'react';
import type { FoodLogItem } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface ManualFoodInputProps {
  onAdd: (item: Omit<FoodLogItem, 'id' | 'timestamp'>) => void;
}

export const ManualFoodInput: React.FC<ManualFoodInputProps> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const caloriesNum = parseFloat(calories);
    if (!name || isNaN(caloriesNum)) return;

    onAdd({
      name,
      calories: caloriesNum,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
    });
    
    // Reset form
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  const InputField: React.FC<{label: string, value: string, onChange: (val: string) => void, placeholder: string, type?: string}> = 
  ({ label, value, onChange, placeholder, type = "number" }) => (
      <div>
        <label className="block text-sm font-medium text-slate-300">{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 block w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-200"
          required={label === t('FOOD_NAME_LABEL') || label === t('CALORIES_LABEL')}
        />
      </div>
  );

  return (
    <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 animate-fade-in">
      <h3 className="text-lg font-bold text-cyan-300 mb-4">{t('MANUAL_INPUT_TITLE')}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <InputField 
            label={t('FOOD_NAME_LABEL')} 
            value={name} 
            onChange={setName}
            placeholder={t('FOOD_NAME_PLACEHOLDER')}
            type="text"
        />
        <div className="grid grid-cols-2 gap-3">
            <InputField label={t('CALORIES_LABEL')} value={calories} onChange={setCalories} placeholder="kcal" />
            <InputField label={t('PROTEIN') + " (g)"} value={protein} onChange={setProtein} placeholder="g" />
            <InputField label={t('CARBS') + " (g)"} value={carbs} onChange={setCarbs} placeholder="g" />
            <InputField label={t('FAT') + " (g)"} value={fat} onChange={setFat} placeholder="g" />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-cyan-600 text-white font-semibold rounded-full hover:bg-cyan-700 transition">
          {t('ADD_FOOD_BUTTON')}
        </button>
      </form>
    </div>
  );
};