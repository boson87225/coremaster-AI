import React, { useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';
import { PlanContext } from '../context/PlanContext';
import { ChevronDown, ChevronUp, Pause, Play, SkipForward, X, Clock, Activity } from './icons';
import { formatTime } from '../utils/time';
import { useTranslation } from '../context/LanguageContext';
import { BodyAvatar, AvatarAction } from './BodyAvatar';

// Helper function to map exercise names (English or Chinese) to avatar actions
const detectActionFromTitle = (title: string): AvatarAction => {
    const t = title.toLowerCase();

    // 0. Combat / Boxing (Priority)
    if (
        t.includes('box') || t.includes('punch') || t.includes('jab') || t.includes('cross') || 
        t.includes('hook') || t.includes('upper') || t.includes('fight') || t.includes('combat') || 
        t.includes('kick') || t.includes('strike') || t.includes('拳') || t.includes('擊')
    ) {
        return 'boxing';
    }

    // 1. Shoulders / Vertical Push
    if (
        t.includes('overhead') || t.includes('military') || t.includes('shoulder press') || t.includes('肩推') || 
        t.includes('push press') || t.includes('jerk') || t.includes('挺舉')
    ) {
        return 'press';
    }

    // 2. Lateral Raises / Flys
    if (
        t.includes('raise') || t.includes('lateral') || t.includes('flat') || t.includes('側平舉') ||
        t.includes('fly') || t.includes('飛鳥') || t.includes('pec deck') || t.includes('夾胸')
    ) {
        return 'lateral';
    }

    // 3. Vertical Pulls (Pullups / Pulldowns)
    if (
        t.includes('pull-up') || t.includes('chin-up') || t.includes('pull up') || t.includes('引體') ||
        t.includes('pulldown') || t.includes('pull down') || t.includes('下拉')
    ) {
        return 'pullup';
    }

    // 4. Horizontal Pulls (Rows)
    if (
        t.includes('row') || t.includes('划船') || 
        t.includes('face pull') || t.includes('面拉') ||
        t.includes('renegade')
    ) {
        return 'row';
    }

    // 5. Horizontal Push (Bench / Pushups)
    if (
        t.includes('bench') || t.includes('chest press') || t.includes('臥推') || t.includes('卧推') ||
        t.includes('floor press')
    ) {
        return 'bench';
    }
    if (
        t.includes('push-up') || t.includes('push up') || t.includes('伏地挺身') || 
        t.includes('burpee') || t.includes('波比') || t.includes('mountain')
    ) {
        return 'pushup';
    }

    // 6. Arms (Biceps/Triceps)
    if (
        t.includes('curl') || t.includes('彎舉') || t.includes('bicep') || t.includes('二頭')
    ) {
        return 'curl';
    }
    if (
        t.includes('tricep') || t.includes('extension') || t.includes('pushdown') || 
        t.includes('skull') || t.includes('dip') || t.includes('三頭') || t.includes('下壓') || t.includes('撐體')
    ) {
        return 'extension';
    }

    // 7. Legs (Squat / Lunge / Hinge)
    if (
        t.includes('deadlift') || t.includes('hard pull') || t.includes('硬舉') || 
        t.includes('rdl') || t.includes('good morning') || t.includes('clean')
    ) {
        if(t.includes('shrug') || t.includes('trap')) return 'shrug';
        return 'deadlift';
    }
    if (
        t.includes('lunge') || t.includes('split') || t.includes('bulgarian') || t.includes('弓箭步') || t.includes('分腿')
    ) {
        return 'lunge';
    }
    if (
        t.includes('squat') || t.includes('深蹲') || t.includes('leg press') || t.includes('腿舉') ||
        t.includes('step') || t.includes('calf') || t.includes('提踵')
    ) {
        return 'squat';
    }

    // 8. Core
    if (
        t.includes('plank') || t.includes('平板') || t.includes('bridge') || t.includes('橋')
    ) {
        return 'plank';
    }
    if (
        t.includes('crunch') || t.includes('sit-up') || t.includes('abs') || t.includes('腹') ||
        t.includes('leg raise') || t.includes('抬腿') || t.includes('twist') || t.includes('轉體') ||
        t.includes('v-up')
    ) {
        return 'crutches';
    }

    // 9. Cardio / Dynamic
    if (
        t.includes('run') || t.includes('jog') || t.includes('sprint') || t.includes('跑') || t.includes('衝刺') || t.includes('shuttle')
    ) {
        return 'running';
    }
    if (
        t.includes('jump') || t.includes('hop') || t.includes('ski') || t.includes('jack') || 
        t.includes('cardio') || t.includes('hiit') || t.includes('跳') || t.includes('繩')
    ) {
        return 'jumping';
    }
    
    if (t.includes('shrug') || t.includes('聳肩')) return 'shrug';

    // Default fallback
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

  // Determine avatar action based on workout status AND exercise name
  let avatarAction: AvatarAction = 'idle';
  if (status === 'playing') {
      avatarAction = detectActionFromTitle(currentExercise.name);
  } else if (status === 'resting' || status === 'paused') {
      avatarAction = 'idle';
  }

  // Use profile defaults if not available
  const avatarProps = {
      gender: userProfile?.gender || 'male',
      weight: userProfile?.weight || 75,
      height: userProfile?.height || 175,
  };

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
              <div className="mt-6 space-y-6 animate-fade-in relative">
                  
                  {/* Holographic Avatar Container */}
                  <div className="flex justify-center -my-4 relative z-0 opacity-80 scale-90">
                      <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full"></div>
                      <BodyAvatar 
                          {...avatarProps} 
                          action={avatarAction} 
                          hideBackground={true} 
                          className="w-32 h-40"
                      />
                  </div>
                  
                  {/* Action Label */}
                  <div className="text-center -mt-2 mb-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border border-white/10 px-2 py-1 rounded-full bg-black/20">
                          Mode: {avatarAction.toUpperCase()}
                      </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 relative z-10">
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