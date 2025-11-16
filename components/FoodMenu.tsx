
import React, { useState, useMemo } from 'react';
import type { FoodLogItem, RecognizedFood } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { COMMON_FOODS } from '../constants';

interface FoodMenuProps {
  onAdd: (item: Omit<FoodLogItem, 'id' | 'timestamp'>) => void;
}

export const FoodMenu: React.FC<FoodMenuProps> = ({ onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  const filteredFoods = useMemo(() => {
    if (!searchTerm) {
      return COMMON_FOODS;
    }
    return COMMON_FOODS.filter(food =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleAdd = (food: RecognizedFood) => {
    onAdd(food);
  };

  return (
    <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 animate-fade-in space-y-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={t('SEARCH_FOOD_PLACEHOLDER')}
        className="w-full p-2 bg-slate-800 border border-slate-600 rounded-full text-slate-200 placeholder-slate-400"
      />
      <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {filteredFoods.map((food, index) => (
          <li key={index} className="p-2 bg-slate-800 rounded-md flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-200">{food.name}</p>
              <p className="text-xs text-slate-400">{Math.round(food.calories)} {t('CALORIES_UNIT')}</p>
            </div>
            <button onClick={() => handleAdd(food)} className="px-3 py-1 bg-cyan-600 text-white text-sm font-semibold rounded-full hover:bg-cyan-700">
              {t('ADD_BUTTON')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};