
import React, { useContext, useMemo } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';
import { PlanContext } from '../context/PlanContext';
import { ChevronDown, ChevronUp, Pause, Play, SkipForward, X, Clock, Activity, BrainCircuit, Zap, Trophy } from './icons';
import { formatTime } from '../utils/time';
import { useTranslation } from '../context/LanguageContext';
import { BodyAvatar, AvatarAction } from './BodyAvatar';

// 偵測動作
const detectActionFromTitle = (title: string): AvatarAction => {
    const t = title.toLowerCase();
    if (t.includes('box') || t.includes('拳') || t.includes('擊')) return 'boxing';
    if (t.includes('run') || t.includes('跑')) return 'running';
    if (t.includes('squat') || t.includes('蹲')) return 'squat';
    if (t.includes('jump') || t.includes('跳')) return 'jumping';
    if (t.includes('push') || t.includes('伏地')) return 'pushup';
    return 'idle';
};

export const WorkoutPlayer: React.FC = () => {
  const { workoutState, pauseWorkout, resumeWorkout, nextExercise, endWorkout, toggleExpand, startRest } = useContext(WorkoutContext);
  const { userProfile } = useContext(PlanContext);
  const { t } = useTranslation();

  const { status, currentPlan, currentDayIndex, currentExerciseIndex, isExpanded, restTimer } = workoutState;

  if (status === 'idle' || !currentPlan) return null;

  const currentDay = currentPlan.days[currentDayIndex];
  const currentExercise = currentDay.exercises[currentExerciseIndex];
  const isSpecialized = !!currentPlan.sportKey;

  let avatarAction: AvatarAction = 'idle';
  if (status === 'playing') {
      avatarAction = detectActionFromTitle(currentExercise.name);
  }

  const avatarProps = {
      gender: userProfile?.gender || 'male',
      weight: userProfile?.weight || 75,
      height: userProfile?.height || 175,
  };

  return (
    <div className={`fixed left-1/2 -translate-x-1/2 z-[60] w-[94%] max-w-lg transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isExpanded ? 'bottom-8' : 'bottom-24'}`}>
      <div className={`glass rounded-[3rem] border shadow-2xl overflow-hidden ${isSpecialized ? 'border-cyan-500/30' : 'border-white/10'}`}>
        {/* 進度條 */}
        <div className="h-1.5 w-full bg-slate-900/50">
            <div className={`h-full transition-all duration-1000 ${isSpecialized ? 'bg-cyan-500 glow-cyan' : 'bg-white'}`} 
                 style={{ width: `${((currentExerciseIndex + 1) / currentDay.exercises.length) * 100}%` }}></div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                    {isSpecialized ? <Zap size={12} className="text-cyan-400 animate-pulse" /> : <Activity size={12} className="text-white/50" />}
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isSpecialized ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {status === 'resting' ? 'Neural Cooling' : isSpecialized ? 'Sport Protocol Active' : 'Active Workout'}
                    </span>
                </div>
                <h4 className="text-xl font-black text-white truncate uppercase italic tracking-tighter">
                    {status === 'resting' ? t('PLAYER_STATUS_RESTING') : currentExercise.name}
                </h4>
            </div>

            <div className="flex items-center gap-3">
                {status === 'resting' ? (
                    <div className="text-3xl font-mono font-black text-cyan-400 tracking-tighter">{formatTime(restTimer)}</div>
                ) : (
                    <button onClick={startRest} className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all ${isSpecialized ? 'bg-cyan-500 text-slate-950' : 'bg-white text-slate-950'}`}>
                        <Clock size={24} />
                    </button>
                )}
                <button onClick={toggleExpand} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    {isExpanded ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
                </button>
            </div>
          </div>

          {isExpanded && (
              <div className="mt-8 space-y-8 animate-fade-in">
                  
                  {isSpecialized ? (
                      /* 專項模式專用：數據儀表板 (Dashboard) */
                      <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 p-5 bg-cyan-950/20 rounded-[2.5rem] border border-cyan-500/20 flex items-center gap-5">
                              <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20">
                                  <Trophy size={32} className="text-cyan-400" />
                              </div>
                              <div className="flex-grow">
                                  <span className="text-[9px] font-black text-cyan-500/50 uppercase">Primary Goal</span>
                                  <p className="text-lg font-black text-white italic">{currentDay.focus}</p>
                                  <div className="h-1 w-full bg-slate-900 mt-2 rounded-full overflow-hidden">
                                      <div className="h-full bg-cyan-500 w-2/3 animate-pulse"></div>
                                  </div>
                              </div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-[2rem] border border-white/5 text-center">
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Load Intensity</span>
                              <span className="text-xl font-black text-white">HIGH</span>
                          </div>
                          <div className="p-4 bg-white/5 rounded-[2rem] border border-white/5 text-center">
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Energy Focus</span>
                              <span className="text-xl font-black text-white">ANAEROBIC</span>
                          </div>
                      </div>
                  ) : (
                      /* 一般模式：模擬小人 */
                      <div className="flex justify-center -my-4 relative">
                          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full"></div>
                          <BodyAvatar {...avatarProps} action={avatarAction} hideBackground={true} className="w-32 h-40" />
                      </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-950/40 p-4 rounded-[2rem] border border-white/5 text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">{t('SETS')}</p>
                          <p className="text-2xl font-black text-white">{currentExercise.sets}</p>
                      </div>
                      <div className="bg-slate-950/40 p-4 rounded-[2rem] border border-white/5 text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">{t('REPS')}</p>
                          <p className="text-2xl font-black text-white">{currentExercise.reps}</p>
                      </div>
                      <div className="bg-slate-950/40 p-4 rounded-[2rem] border border-white/5 text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">{t('REST')}</p>
                          <p className="text-2xl font-black text-white">{currentExercise.rest}</p>
                      </div>
                  </div>

                  {currentExercise.notes && (
                      <div className="p-5 bg-cyan-500/5 rounded-3xl border border-cyan-500/10 text-xs text-cyan-200 italic flex gap-3 items-start">
                          <BrainCircuit size={16} className="text-cyan-500 flex-shrink-0" />
                          <span>{currentExercise.notes}</span>
                      </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                      <button onClick={endWorkout} className="flex items-center gap-2 text-red-500/60 text-[10px] font-black uppercase hover:text-red-500 transition-colors">
                          <X size={14} /> {t('PLAYER_END_WORKOUT')}
                      </button>
                      <div className="flex gap-3">
                          <button onClick={() => status === 'paused' ? resumeWorkout() : pauseWorkout()} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                              {status === 'paused' ? <Play size={24} /> : <Pause size={24} />}
                          </button>
                          <button onClick={nextExercise} className={`px-8 h-14 rounded-2xl font-black text-xs uppercase flex items-center gap-3 transition-all ${isSpecialized ? 'bg-cyan-500 text-slate-950' : 'bg-white text-slate-950'}`}>
                              {t('PLAYER_NEXT_ACTION_BUTTON')} <SkipForward size={20} />
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
