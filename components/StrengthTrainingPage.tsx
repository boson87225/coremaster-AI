
import React, { useState } from 'react';
import { Dumbbell } from './icons';
import { STRENGTH_EXERCISES } from '../constants';
import type { StrengthMode } from '../types';

export const StrengthTrainingPage: React.FC = () => {
    const [mode, setMode] = useState<StrengthMode>('primary');
    const [filter, setFilter] = useState<string>('all');

    const getFilters = () => {
        if (mode === 'primary') {
            return ['all', '胸', '背', '腿'];
        } else {
            return ['all', '上半身', '下半身'];
        }
    };

    const filteredExercises = STRENGTH_EXERCISES.filter(ex => {
        if (filter === 'all') return true;
        if (mode === 'primary') {
            return ex.primary === filter;
        } else {
            return ex.secondary === filter;
        }
    });

    return (
        <section className="p-4 md:p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl max-w-lg mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b border-slate-700 pb-3 flex items-center">
                <Dumbbell className="w-6 h-6 mr-2" /> 重訓日誌與目標追蹤
            </h2>

            <div className="flex justify-center space-x-4 mb-4">
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

            <div className="flex justify-center flex-wrap gap-2 mb-6">
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

            <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                <p className="text-sm font-bold text-cyan-300 mb-2">🎯 目標與 PR 追蹤 (功能規劃)</p>
                <ul className="list-disc list-inside text-xs text-slate-400 ml-4 mt-2 space-y-1">
                    <li>個人紀錄 (PR) - 例如：深蹲 100kg x 1</li>
                    <li>訓練進度 - 紀錄每次訓練的組數、次數、重量</li>
                </ul>
            </div>

            <h3 className="text-lg font-bold text-slate-300 border-b border-slate-700 pb-1">訓練項目列表 ({filteredExercises.length})</h3>
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {filteredExercises.map(ex => (
                    <li key={ex.id} className="p-3 bg-slate-700/50 rounded-lg shadow-sm border border-slate-700 flex justify-between items-center">
                        <span className="font-semibold text-slate-200">{ex.name}</span>
                        <div className="flex space-x-2 text-xs">
                            <span className="bg-cyan-400/20 text-cyan-200 px-2 py-0.5 rounded-full">{ex.primary}</span>
                            <span className="bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">{ex.secondary}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};