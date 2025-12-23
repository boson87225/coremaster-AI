
import React, { useState, useContext } from 'react';
import { Dumbbell, CheckCircle, Clock } from './icons';
import { STRENGTH_EXERCISES } from '../constants';
import type { StrengthMode } from '../types';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';

export const StrengthTrainingPage: React.FC = () => {
    const { addActivityLogItem, activityLog } = useContext(PlanContext);
    const { t } = useTranslation();
    const [mode, setMode] = useState<StrengthMode>('primary');
    const [filter, setFilter] = useState<string>('all');
    const [successId, setSuccessId] = useState<number | null>(null);

    const getFilters = () => {
        if (mode === 'primary') return ['all', '胸', '背', '腿'];
        return ['all', '上半身', '下半身'];
    };

    const filteredExercises = STRENGTH_EXERCISES.filter(ex => {
        if (filter === 'all') return true;
        return mode === 'primary' ? ex.primary === filter : ex.secondary === filter;
    });

    const handleLogExercise = (name: string, id: number) => {
        addActivityLogItem({
            name,
            type: 'strength',
            details: '手動紀錄'
        });
        setSuccessId(id);
        setTimeout(() => setSuccessId(null), 2000);
    };

    return (
        <section className="p-4 md:p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl max-w-lg mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-slate-700 pb-3 flex items-center">
                <Dumbbell className="w-6 h-6 mr-2" /> 快速重訓紀錄
            </h2>

            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => { setMode('primary'); setFilter('all'); }}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${mode === 'primary' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                >
                    胸背腿
                </button>
                <button
                    onClick={() => { setMode('secondary'); setFilter('all'); }}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${mode === 'secondary' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                >
                    上半身/下半身
                </button>
            </div>

            <div className="flex justify-center flex-wrap gap-2">
                {getFilters().map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 text-sm rounded-full font-medium transition ${filter === f ? 'bg-cyan-400/20 text-cyan-200 border-cyan-400 border' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        {f === 'all' ? '全部項目' : f}
                    </button>
                ))}
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {filteredExercises.map(ex => (
                    <div key={ex.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-700 flex justify-between items-center transition hover:bg-slate-700">
                        <div>
                            <span className="font-semibold text-slate-200 block">{ex.name}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{ex.primary} • {ex.secondary}</span>
                        </div>
                        <button 
                            onClick={() => handleLogExercise(ex.name, ex.id)}
                            className={`p-2 rounded-full transition ${successId === ex.id ? 'bg-green-600 text-white' : 'bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600 hover:text-white'}`}
                        >
                            {successId === ex.id ? <CheckCircle size={20} /> : <Dumbbell size={20} />}
                        </button>
                    </div>
                ))}
            </div>

            {activityLog.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                    <h3 className="text-sm font-bold text-slate-400 mb-2 flex items-center gap-2">
                        <Clock size={14}/> 最近完成的動作
                    </h3>
                    <div className="space-y-2">
                        {activityLog.filter(a => a.type === 'strength').slice(0, 3).map(a => (
                            <div key={a.id} className="text-xs flex justify-between text-slate-500">
                                <span>{a.name}</span>
                                <span>{new Date(a.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};
