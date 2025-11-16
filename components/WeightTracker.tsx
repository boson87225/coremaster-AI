
import React, { useState, useContext, useMemo } from 'react';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import { WeightChart } from './WeightChart';
import { Trash2 } from './icons';

export const WeightTracker: React.FC = () => {
    const { weightLog, addWeightLogItem, removeWeightLogItem } = useContext(PlanContext);
    const [weightInput, setWeightInput] = useState('');
    const [dateInput, setDateInput] = useState(() => new Date().toISOString().split('T')[0]);
    const { t } = useTranslation();

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const weight = parseFloat(weightInput);
        if (!isNaN(weight) && weight > 0 && dateInput) {
            addWeightLogItem({ date: dateInput, weight });
            setWeightInput('');
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                <h3 className="text-lg font-bold text-cyan-300 mb-2">{t('LOG_WEIGHT_TITLE')}</h3>
                <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
                    <div className="flex-auto" style={{minWidth: '120px'}}>
                        <label htmlFor="weight-date" className="block text-xs font-medium text-slate-400 mb-1">{t('DATE_LABEL')}</label>
                        <input
                            id="weight-date"
                            type="date"
                            value={dateInput}
                            onChange={(e) => setDateInput(e.target.value)}
                            max={todayStr}
                            className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm text-slate-200"
                            required
                        />
                    </div>
                     <div className="flex-auto" style={{minWidth: '100px'}}>
                        <label htmlFor="weight-value" className="block text-xs font-medium text-slate-400 mb-1">{t('WEIGHT')} ({t('WEIGHT_UNIT')})</label>
                        <input
                            id="weight-value"
                            type="number"
                            step="0.1"
                            value={weightInput}
                            onChange={(e) => setWeightInput(e.target.value)}
                            placeholder={t('WEIGHT_INPUT_PLACEHOLDER')}
                            className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm text-slate-200"
                            required
                        />
                    </div>
                    <button type="submit" className="flex-shrink-0 py-2 px-4 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition self-end h-[42px]">
                        {t('SAVE_WEIGHT_BUTTON')}
                    </button>
                </form>
            </div>

            <div>
                <h3 className="text-xl font-bold text-slate-200 mb-2">{t('WEIGHT_TRENDS_CHART')}</h3>
                <WeightChart data={weightLog} />
            </div>

            <div className="border-t border-slate-700 pt-4 space-y-3">
                <h3 className="text-xl font-bold text-slate-200">{t('WEIGHT_HISTORY')}</h3>
                {weightLog.length > 0 ? (
                    <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {weightLog.map(item => (
                            <li key={item.date} className="p-3 bg-slate-700/50 rounded-lg shadow-sm border border-slate-700 flex justify-between items-center">
                                <div>
                                    <p className={`font-semibold text-slate-200 ${item.date === todayStr ? 'text-cyan-300' : ''}`}>
                                        {item.date === todayStr ? `${item.date} (${t('TODAYS_LOG')})` : item.date}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-mono text-lg text-slate-300">{item.weight.toFixed(1)} {t('WEIGHT_UNIT')}</p>
                                    <button onClick={() => removeWeightLogItem(item.date)} className="p-1 text-red-500 hover:text-red-400">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-slate-500 py-4">{t('NO_WEIGHT_LOGGED')}</p>
                )}
            </div>
        </div>
    );
};