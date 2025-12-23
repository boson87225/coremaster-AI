
import React, { useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';
import { ChevronDown, ChevronUp, Pause, Play, SkipForward, X, Clock, Activity } from './icons';
import { formatTime } from '../utils/time';
import { useTranslation } from '../context/LanguageContext';

export const WorkoutPlayer: React.FC = () => {
  const { workoutState, pauseWorkout, resumeWorkout, nextExercise, endWorkout, toggleExpand, startRest, apiKeyError, handleSetApiKey } = useContext(WorkoutContext);
  const { t } = useTranslation();

  const { status, currentPlan, currentDayIndex, currentExerciseIndex, isExpanded, restTimer } = workoutState;

  if (status === 'idle' || !currentPlan) return null;

  const currentDay = currentPlan.days[currentDayIndex];
  const currentExercise = currentDay.exercises[currentExerciseIndex];

  return (
    <div className={`fixed left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-lg transition-all duration-500 ease-in-out ${isExpanded ? 'bottom-8' : 'bottom-24'}`}>
      <div className="glass rounded-[32px] border border-white/10 shadow-2xl overflow-hidden glow-cyan">
        {/* Header Indicator */}
        <div className="h-1 w-full bg-slate-800">
            <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${((currentExerciseIndex + 1) / currentDay.exercises.length) * 100}%` }}></div>
        </div>

        <div className="p-4">
          {/* Main Info Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <Activity size={12} className="text-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest">
                        {status === 'resting' ? 'System Cooling' : 'Active Protocol'}
                    </span>
                </div>
                <h4 className="text-lg font-extrabold text-white truncate uppercase tracking-tight">
                    {status === 'resting' ? t('PLAYER_STATUS_RESTING') : currentExercise.name}
                </h4>
            </div>

            <div className="flex items-center gap-2">
                {status === 'resting' ? (
                    <div className="text-2xl font-mono font-bold text-cyan-400 glow-text-cyan">{formatTime(restTimer)}</div>
                ) : (
                    <button onClick={startRest} className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-lg hover:bg-cyan-500 transition-all">
                        <Clock size={20} className="text-white" />
                    </button>
                )}
                <button onClick={toggleExpand} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
              <div className="mt-6 space-y-6 animate-fade-in">
                  <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5 text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{t('SETS')}</p>
                          <p className="text-xl font-mono font-bold text-white">{currentExercise.sets}</p>
                      </div>
                      <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5 text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{t('REPS')}</p>
                          <p className="text-xl font-mono font-bold text-white">{currentExercise.reps}</p>
                      </div>
                      <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5 text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{t('REST')}</p>
                          <p className="text-xl font-mono font-bold text-white">{currentExercise.rest}</p>
                      </div>
                  </div>

                  {currentExercise.notes && (
                      <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-xs text-indigo-300 italic flex gap-2">
                          <span className="not-italic">💡</span> {currentExercise.notes}
                      </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                      <button onClick={endWorkout} className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase hover:text-red-300">
                          <X size={16} /> {t('PLAYER_END_WORKOUT')}
                      </button>
                      <div className="flex gap-2">
                          <button onClick={() => status === 'paused' ? resumeWorkout() : pauseWorkout()} className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                              {status === 'paused' ? <Play size={20} /> : <Pause size={20} />}
                          </button>
                          <button onClick={nextExercise} className="px-6 h-12 bg-white text-slate-950 rounded-full font-extrabold text-sm uppercase flex items-center gap-2 hover:bg-slate-200 transition-colors">
                              {t('PLAYER_NEXT_ACTION_BUTTON')} <SkipForward size={18} />
                          </button>
                      </div>
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
