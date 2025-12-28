
import React, { useState, useRef, useMemo, useContext, useEffect } from 'react';
import { History, Camera, Loader2, X, Trash2, Edit, List, Scale, Zap, Clock, WifiOff, ChevronDown } from './icons';
import { recognizeFoodInImage, triggerKeySetup } from '../services/geminiService';
import type { FoodLogItem, RecognizedFood, ActivityLogItem } from '../types';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import { ManualFoodInput } from './ManualFoodInput';
import { FoodMenu } from './FoodMenu';
import { TabButton } from './TabButton';
import { WeightTracker } from './WeightTracker';

type TrackerMode = 'food' | 'weight' | 'activity';
type InputMode = 'camera' | 'manual' | 'menu';

const ActivityTracker: React.FC = () => {
    const { activityLog } = useContext(PlanContext);
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            {activityLog.length === 0 ? (
                <p className="text-center text-slate-500 py-8 italic">尚無活動紀錄</p>
            ) : (
                <div className="space-y-2">
                    {activityLog.slice(0, 10).map(item => (
                        <div key={item.id} className="p-3 bg-slate-900/40 rounded-2xl border border-white/5 flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${item.type === 'strength' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                {item.type === 'strength' ? <Zap size={16} /> : <Clock size={16} />}
                            </div>
                            <div className="flex-grow">
                                <p className="text-xs font-bold text-slate-200">{item.name}</p>
                                <p className="text-[9px] text-slate-500">{item.details}</p>
                            </div>
                            <span className="text-[9px] text-slate-600 font-mono">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const TrackerPage: React.FC<{ userId: string | null }> = ({ userId }) => {
  const [mode, setMode] = useState<TrackerMode>('food');
  const { foodLog, addFoodLogItem, removeFoodLogItem } = useContext(PlanContext);
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-fade-in">
        <header className="px-1 flex justify-between items-center">
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Tracker</h1>
            <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5">
                <button onClick={() => setMode('food')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'food' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>Food</button>
                <button onClick={() => setMode('weight')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'weight' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>Weight</button>
                <button onClick={() => setMode('activity')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'activity' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>Activity</button>
            </div>
        </header>

        {mode === 'food' && (
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 bg-slate-900/40 p-1 rounded-2xl">
                    <button onClick={() => setInputMode('camera')} className={`py-2 rounded-xl text-[8px] font-black uppercase ${inputMode === 'camera' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-600'}`}>Camera</button>
                    <button onClick={() => setInputMode('manual')} className={`py-2 rounded-xl text-[8px] font-black uppercase ${inputMode === 'manual' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-600'}`}>Manual</button>
                    <button onClick={() => setInputMode('menu')} className={`py-2 rounded-xl text-[8px] font-black uppercase ${inputMode === 'menu' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-600'}`}>Menu</button>
                </div>
                
                {inputMode === 'camera' && (
                    <button className="w-full h-32 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-cyan-500/30 transition-all">
                        <Camera className="text-slate-700" size={32} />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">點擊開啟相機辨識</span>
                    </button>
                )}

                {/* 緊湊型日誌列表 */}
                <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase px-2">Today's Consumption</h3>
                    {foodLog.map(item => (
                        <div key={item.id} className="p-3 bg-slate-900/40 rounded-2xl border border-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-slate-200">{item.name}</p>
                                <p className="text-[9px] text-slate-500">{item.calories} kcal</p>
                            </div>
                            <button onClick={() => removeFoodLogItem(item.id)} className="text-red-900 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {mode === 'weight' && <WeightTracker />}
        {mode === 'activity' && <ActivityTracker />}
    </div>
  );
};
