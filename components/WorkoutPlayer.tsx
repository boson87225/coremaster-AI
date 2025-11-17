
import React, { useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';
import { ChevronDown, ChevronUp, Pause, Play, SkipForward, X, Clock } from './icons';
import { formatTime } from '../utils/time';
import { useTranslation } from '../context/LanguageContext';

export const WorkoutPlayer: React.FC = () => {
  const { workoutState, pauseWorkout, resumeWorkout, nextExercise, endWorkout, toggleExpand, startRest, apiKeyError, handleSetApiKey } = useContext(WorkoutContext);
  const { t } = useTranslation();

  const { status, currentPlan, currentDayIndex, currentExerciseIndex, isExpanded, restTimer } = workoutState;

  if (status === 'idle' || !currentPlan) {
    return null;
  }

  const currentDay = currentPlan.days[currentDayIndex];
  const currentExercise = currentDay.exercises[currentExerciseIndex];

  const handlePrimaryAction = () => {
      if (status === 'playing') {
          startRest();
      } else if (status === 'paused') {
          resumeWorkout();
      }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 text-white font-sans">
      <div className={`max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-lg border-t border-slate-700 rounded-t-2xl shadow-2xl transition-all duration-300 ease-in-out ${isExpanded ? 'mb-0' : 'mb-[-120px] md:mb-[-100px]'}`}>
        {/* Main Control Bar */}
        <div className="flex items-center p-3">
          {apiKeyError ? (
            <>
              <div className="flex-grow text-red-400">
                  <p className="font-bold text-sm">{t('TTS_ERROR_TITLE')}</p>
                  <p className="text-xs">{t('TTS_ERROR_DESC')}</p>
              </div>
              <div className="flex items-center space-x-2">
                  <button onClick={handleSetApiKey} className="px-4 py-2 bg-cyan-600 rounded-full text-sm font-semibold">
                      {t('SET_API_KEY_BUTTON')}
                  </button>
                  <button onClick={endWorkout} className="p-3 bg-red-600 rounded-full hover:bg-red-500 transition" title={t('PLAYER_END_WORKOUT')}>
                      <X size={24} />
                  </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-grow">
                <p className="text-sm font-light text-slate-400">
                    {status === 'resting' ? t('PLAYER_STATUS_RESTING') : currentDay.title}
                </p>
                <p className="text-lg font-bold truncate">
                    {status === 'resting' ? `${t('PLAYER_NEXT_EXERCISE')}: ${currentDay.exercises[currentExerciseIndex + 1]?.name || t('PLAYER_WORKOUT_COMPLETE')}` : currentExercise.name}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {status !== 'resting' && (
                    <button onClick={handlePrimaryAction} className="p-3 bg-cyan-600 rounded-full hover:bg-cyan-500 transition" title={status === 'playing' ? t('PLAYER_START_REST') : t('RESUME_BUTTON')}>
                        {status === 'playing' ? <Clock size={24} /> : <Play size={24} />}
                    </button>
                )}
                 {status === 'resting' && (
                    <div className="text-3xl font-mono p-2 text-cyan-300">{formatTime(restTimer)}</div>
                )}
                <button onClick={endWorkout} className="p-3 bg-red-600 rounded-full hover:bg-red-500 transition" title={t('PLAYER_END_WORKOUT')}>
                  <X size={24} />
                </button>
                <button onClick={toggleExpand} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition" title={isExpanded ? t('PLAYER_COLLAPSE') : t('PLAYER_EXPAND')}>
                  {isExpanded ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Expanded Details */}
        <div className="px-4 pb-4">
            <div className="bg-white/5 p-4 rounded-lg">
                <div className="grid grid-cols-3 text-center mb-3">
                    <div>
                        <p className="text-sm text-slate-400">{t('SETS')}</p>
                        <p className="text-2xl font-bold">{currentExercise.sets}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">{t('REPS')}</p>
                        <p className="text-2xl font-bold">{currentExercise.reps}</p>
                    </div>
                     <div>
                        <p className="text-sm text-slate-400">{t('REST')}</p>
                        <p className="text-2xl font-bold">{currentExercise.rest}</p>
                    </div>
                </div>
                {currentExercise.notes && (
                    <p className="mt-2 text-xs text-center text-yellow-300 bg-yellow-500/20 p-2 rounded">
                        💡 {currentExercise.notes}
                    </p>
                )}
            </div>
             <div className="flex justify-between items-center mt-3">
                <button onClick={() => status === 'playing' ? pauseWorkout() : resumeWorkout()} className="flex items-center gap-2 text-sm px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                     {status === 'paused' ?  <Play size={16}/> : <Pause size={16} />}
                     {status === 'paused' ?  t('RESUME_BUTTON') : t('PAUSE_BUTTON')}
                </button>
                <button onClick={nextExercise} className="flex items-center gap-2 text-sm px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                    {t('PLAYER_NEXT_ACTION_BUTTON')} <SkipForward size={16} />
                </button>
             </div>
        </div>

      </div>
    </div>
  );
};