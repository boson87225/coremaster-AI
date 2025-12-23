
import React, { useContext } from 'react';
import { Play, Clock, Dumbbell, Zap } from './icons';
import { WorkoutContext } from '../context/WorkoutContext';
import { useTranslation } from '../context/LanguageContext';
import type { WorkoutPlan, WorkoutDay } from '../types';

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  showAllDays?: boolean;
  activeDayIndex?: number;
}

export const WorkoutPlanCard: React.FC<WorkoutPlanCardProps> = ({ plan, showAllDays = true, activeDayIndex = 0 }) => {
  const { startWorkout } = useContext(WorkoutContext);
  const { t } = useTranslation();

  const daysToRender = showAllDays ? plan.days : [plan.days[activeDayIndex]].filter(Boolean);

  return (
    <div className="space-y-6">
      {daysToRender.map((day, idx) => (
        <div key={day.day} className="glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-xl shadow-black/20">
          <div className="p-7 bg-white/5 flex justify-between items-center border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Sequence {day.day}</span>
              </div>
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{day.title}</h4>
              <p className="text-[10px] font-black text-slate-400 mt-2 flex items-center gap-1 uppercase tracking-widest">
                <Zap size={10} className="text-cyan-500" /> {day.focus}
              </p>
            </div>
            <button 
              onClick={() => startWorkout(plan, showAllDays ? idx : activeDayIndex)}
              className="w-16 h-16 bg-white text-slate-900 rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
              <Play size={28} fill="currentColor" />
            </button>
          </div>
          
          <div className="p-7 space-y-5 bg-black/10">
            {day.exercises.map((ex, index) => (
              <div key={index} className="flex items-center gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 font-mono text-xs font-black text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-400/30 transition-all">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-extrabold text-white uppercase tracking-tight mb-1">{ex.name}</p>
                  <div className="flex gap-5">
                    <span className="text-[10px] font-black text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                      <Dumbbell size={10} className="text-cyan-500/50" /> {ex.sets} Sets
                    </span>
                    <span className="text-[10px] font-black text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                      <Clock size={10} className="text-cyan-500/50" /> {ex.rest} Rest
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
