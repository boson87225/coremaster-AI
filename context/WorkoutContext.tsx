
import React, { createContext, useState, useRef, useCallback, useEffect, useContext } from 'react';
import type { WorkoutPlan, WorkoutContextType, WorkoutState } from '../types';
import { textToSpeech } from '../services/ttsService';
import { decode, decodeAudioData } from '../utils/audio';
import { useTranslation } from './LanguageContext';
import { PlanContext } from './PlanContext';

const initialState: WorkoutState = {
  currentPlan: null,
  currentDayIndex: 0,
  currentExerciseIndex: 0,
  status: 'idle',
  isExpanded: false,
  restTimer: 0,
};

export const WorkoutContext = createContext<WorkoutContextType>({
  workoutState: initialState,
  startWorkout: () => {},
  pauseWorkout: () => {},
  resumeWorkout: () => {},
  nextExercise: () => {},
  endWorkout: () => {},
  toggleExpand: () => {},
  startRest: () => {},
  apiKeyError: false,
  handleSetApiKey: async () => {},
});

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workoutState, setWorkoutState] = useState<WorkoutState>(initialState);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const { t } = useTranslation();
  const { addActivityLogItem } = useContext(PlanContext);

  const [apiKeyError, setApiKeyError] = useState(false);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);

  const getAudioContext = () => {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          try {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          } catch (e) {
              console.error("Could not create AudioContext:", e);
              return null;
          }
      }
      return audioContextRef.current;
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  const speak = useCallback(async (text: string) => {
    const context = getAudioContext();
    if (!context) return;
    
    if (context.state === 'suspended') {
        try {
            await context.resume();
        } catch (e) {
            console.error("Could not resume AudioContext:", e);
            return;
        }
    }
    
    setApiKeyError(false);

    try {
        const base64Audio = await textToSpeech(text);
        if (base64Audio) {
            try {
                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    context,
                    24000, 
                    1
                );
                const source = context.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(context.destination);
                
                const now = context.currentTime;
                const startTime = Math.max(now, nextStartTimeRef.current);
                source.start(startTime);
                nextStartTimeRef.current = startTime + audioBuffer.duration;
            } catch (error) {
                console.error("Error playing audio:", error);
            }
        }
    } catch (error: any) {
        console.error("TTS call failed", error);
        const errorMessage = error.toString().toLowerCase();
        if (errorMessage.includes("api key") || errorMessage.includes("permission denied") || errorMessage.includes("authentication") || errorMessage.includes("requested entity was not found")) {
            setApiKeyError(true);
            setLastFailedText(text);
        }
    }
  }, []);

  const nextExercise = useCallback(() => {
    setWorkoutState(prev => {
        if (!prev.currentPlan) return prev;

        const currentDay = prev.currentPlan.days[prev.currentDayIndex];
        const isLastExercise = prev.currentExerciseIndex >= currentDay.exercises.length - 1;

        if (isLastExercise) {
            // Log activity on finish
            addActivityLogItem({
                name: currentDay.title,
                type: 'strength',
                details: `${currentDay.exercises.length} 個動作已完成`
            });
            speak(t('TTS_END_WORKOUT'));
            return initialState;
        } else {
            const nextIndex = prev.currentExerciseIndex + 1;
            const nextExerciseName = currentDay.exercises[nextIndex].name;
            speak(t('TTS_NEXT_EXERCISE', { exercise: nextExerciseName }));
            return { ...prev, currentExerciseIndex: nextIndex, status: 'playing', restTimer: 0 };
        }
    });
  }, [speak, t, addActivityLogItem]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    if (workoutState.status === 'resting' && workoutState.restTimer > 0) {
      timer = setInterval(() => {
        setWorkoutState(prev => {
          const newTime = prev.restTimer - 1;
          if (newTime <= 3 && newTime > 0) {
            speak(String(newTime));
          }
          return { ...prev, restTimer: newTime >= 0 ? newTime : 0 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [workoutState.status, workoutState.restTimer, speak]);

  useEffect(() => {
    if (workoutState.status === 'resting' && workoutState.restTimer === 0) {
      nextExercise();
    }
  }, [workoutState.status, workoutState.restTimer, nextExercise]);

  const startWorkout = useCallback((plan: WorkoutPlan, dayIndex: number) => {
    setWorkoutState({
      ...initialState,
      currentPlan: plan,
      currentDayIndex: dayIndex,
      status: 'playing',
      isExpanded: true,
    });
    const firstExerciseName = plan.days[dayIndex].exercises[0].name;
    // Enhanced prompt as requested by user's "向心爆發、離心控制"
    const welcomeMsg = `${t('TTS_START_WORKOUT', { exercise: firstExerciseName })}。請注意向心收縮時爆發發力，離心收縮時穩定控制速度。`;
    speak(welcomeMsg);
  }, [speak, t]);

  const pauseWorkout = () => {
    if (workoutState.status === 'playing' || workoutState.status === 'resting') {
      setWorkoutState(prev => ({ ...prev, status: 'paused' }));
    }
  };
  
  const resumeWorkout = useCallback(() => {
    setWorkoutState(prev => {
        if (prev.status !== 'paused') return prev;
        return { ...prev, status: prev.restTimer > 0 ? 'resting' : 'playing' };
    });
  }, []);
  
  const endWorkout = () => {
    if (workoutState.currentPlan) {
        const currentDay = workoutState.currentPlan.days[workoutState.currentDayIndex];
        addActivityLogItem({
            name: currentDay.title,
            type: 'strength',
            details: `手動提前結束 (完成 ${workoutState.currentExerciseIndex + 1}/${currentDay.exercises.length})`
        });
    }
    setWorkoutState(initialState);
    speak(t('TTS_END_WORKOUT'));
  };
  
  const toggleExpand = () => {
      setWorkoutState(prev => ({...prev, isExpanded: !prev.isExpanded}));
  };

  const startRest = useCallback(() => {
    setWorkoutState(prevState => {
      if (!prevState.currentPlan || prevState.status !== 'playing') return prevState;
      const currentExercise = prevState.currentPlan.days[prevState.currentDayIndex].exercises[prevState.currentExerciseIndex];
      const restDuration = parseInt(currentExercise.rest, 10) || 60;
      speak(t('TTS_START_REST', { duration: restDuration.toString() }));
      return { ...prevState, status: 'resting', restTimer: restDuration };
    });
  }, [speak, t]);

  const handleSetApiKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        setApiKeyError(false);
        if (lastFailedText) {
            setTimeout(() => {
                speak(lastFailedText);
                setLastFailedText(null);
            }, 500);
        }
    }
  };

  return (
    <WorkoutContext.Provider value={{ workoutState, startWorkout, pauseWorkout, resumeWorkout, nextExercise, endWorkout, toggleExpand, startRest, apiKeyError, handleSetApiKey }}>
      {children}
    </WorkoutContext.Provider>
  );
};
