
import React, { useState, useContext } from 'react';
import { ClipboardList, Plus, Trash2, CheckCircle, ArrowLeft, Dumbbell, Clock } from './icons';
import { PlanContext } from '../context/PlanContext';
import { useTranslation } from '../context/LanguageContext';
import type { WorkoutPlan, WorkoutDay, WorkoutExercise, Page } from '../types';

interface ManualPlannerPageProps {
  setPage: (page: Page) => void;
}

export const ManualPlannerPage: React.FC<ManualPlannerPageProps> = ({ setPage }) => {
  const { setActiveWorkoutPlan } = useContext(PlanContext);
  const { t } = useTranslation();

  const [planTitle, setPlanTitle] = useState('');
  const [planSummary, setPlanSummary] = useState('');
  const [days, setDays] = useState<WorkoutDay[]>([
    { day: 1, title: '', focus: '', exercises: [{ name: '', sets: '', reps: '', rest: '60s' }] }
  ]);

  const addDay = () => {
    setDays([...days, { 
      day: days.length + 1, 
      title: '', 
      focus: '', 
      exercises: [{ name: '', sets: '', reps: '', rest: '60s' }] 
    }]);
  };

  const removeDay = (index: number) => {
    if (days.length === 1) return;
    const newDays = days.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 }));
    setDays(newDays);
  };

  const updateDay = (index: number, field: keyof WorkoutDay, value: string) => {
    const newDays = [...days];
    (newDays[index] as any)[field] = value;
    setDays(newDays);
  };

  const addExercise = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].exercises.push({ name: '', sets: '', reps: '', rest: '60s' });
    setDays(newDays);
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    const newDays = [...days];
    if (newDays[dayIndex].exercises.length === 1) return;
    newDays[dayIndex].exercises = newDays[dayIndex].exercises.filter((_, i) => i !== exIndex);
    setDays(newDays);
  };

  const updateExercise = (dayIndex: number, exIndex: number, field: keyof WorkoutExercise, value: string) => {
    const newDays = [...days];
    (newDays[dayIndex].exercises[exIndex] as any)[field] = value;
    setDays(newDays);
  };

  const handleSave = () => {
    if (!planTitle.trim()) {
      alert(t('PLAN_TITLE_LABEL') + ' is required');
      return;
    }
    const plan: WorkoutPlan = { planTitle, planSummary, days };
    setActiveWorkoutPlan(plan);
    setPage('my_plan');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t('MANUAL_PLAN_TITLE')}</h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] font-bold mt-2">Offline Module</p>
        </div>
        <button onClick={() => setPage('my_plan')} className="w-10 h-10 rounded-2xl glass flex items-center justify-center border border-white/10 hover:border-cyan-500 transition-colors">
          <ArrowLeft size={18} className="text-slate-200" />
        </button>
      </header>

      <div className="space-y-6">
        <div className="glass p-6 rounded-[2rem] border border-white/10 space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">{t('PLAN_TITLE_LABEL')}</label>
            <input 
              type="text" 
              value={planTitle} 
              onChange={e => setPlanTitle(e.target.value)}
              placeholder={t('PLAN_TITLE_PLACEHOLDER')}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">{t('PLAN_SUMMARY_LABEL')}</label>
            <textarea 
              value={planSummary} 
              onChange={e => setPlanSummary(e.target.value)}
              placeholder={t('PLAN_SUMMARY_PLACEHOLDER')}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-cyan-500 transition-colors min-h-[80px]"
            />
          </div>
        </div>

        {days.map((day, dIdx) => (
          <div key={dIdx} className="glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-xl shadow-black/20 animate-fade-in">
            <div className="p-6 bg-white/5 flex justify-between items-center border-b border-white/5">
              <div className="flex-grow space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Day {day.day}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    value={day.title} 
                    onChange={e => updateDay(dIdx, 'title', e.target.value)}
                    placeholder="Day Title (e.g., Push)"
                    className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white font-bold outline-none"
                  />
                  <input 
                    type="text" 
                    value={day.focus} 
                    onChange={e => updateDay(dIdx, 'focus', e.target.value)}
                    placeholder="Focus (e.g., Chest)"
                    className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white font-bold outline-none"
                  />
                </div>
              </div>
              <button onClick={() => removeDay(dIdx)} className="p-3 text-slate-600 hover:text-red-400 transition-colors ml-4">
                <Trash2 size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 bg-black/10">
              {day.exercises.map((ex, eIdx) => (
                <div key={eIdx} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4 relative group">
                  <button onClick={() => removeExercise(dIdx, eIdx)} className="absolute top-2 right-2 text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                  <input 
                    type="text" 
                    value={ex.name} 
                    onChange={e => updateExercise(dIdx, eIdx, 'name', e.target.value)}
                    placeholder="Exercise Name"
                    className="w-full bg-transparent border-b border-white/10 p-1 text-sm text-white font-extrabold outline-none focus:border-cyan-500"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-[8px] font-black text-slate-600 uppercase mb-1 block">Sets</span>
                      <input 
                        type="text" 
                        value={ex.sets} 
                        onChange={e => updateExercise(dIdx, eIdx, 'sets', e.target.value)}
                        placeholder="3"
                        className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-white text-center font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-600 uppercase mb-1 block">Reps</span>
                      <input 
                        type="text" 
                        value={ex.reps} 
                        onChange={e => updateExercise(dIdx, eIdx, 'reps', e.target.value)}
                        placeholder="10-12"
                        className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-white text-center font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-600 uppercase mb-1 block">Rest</span>
                      <input 
                        type="text" 
                        value={ex.rest} 
                        onChange={e => updateExercise(dIdx, eIdx, 'rest', e.target.value)}
                        placeholder="60s"
                        className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-white text-center font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => addExercise(dIdx)}
                className="w-full py-3 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-slate-500 uppercase hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
              >
                <Plus size={14} /> {t('ADD_EXERCISE')}
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={addDay}
          className="w-full py-5 glass border border-dashed border-white/20 rounded-[2rem] flex items-center justify-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
        >
          <Plus size={20} /> {t('ADD_DAY')}
        </button>

        <button 
          onClick={handleSave}
          className="w-full py-6 bg-cyan-500 text-slate-950 font-black rounded-[2.5rem] shadow-2xl shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3"
        >
          <CheckCircle size={20} /> {t('SAVE_PLAN_BUTTON')}
        </button>
      </div>
    </div>
  );
};
