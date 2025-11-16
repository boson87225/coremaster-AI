import React, { createContext, useState, useRef, useCallback, useEffect } from 'react';
import type { WorkoutPlan, WorkoutContextType, WorkoutState } from '../types';
import { textToSpeech } from '../services/ttsService';
import { decode, decodeAudioData } from '../utils/audio';
import { useTranslation } from './LanguageContext';

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
});

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workoutState, setWorkoutState] = useState<WorkoutState>(initialState);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { t } = useTranslation();

  // Lazily initialize and get the AudioContext
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

  // Effect to clean up the AudioContext when the provider unmounts
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
  }, []);

  const startWorkout = useCallback((plan: WorkoutPlan, dayIndex: number) => {
    setWorkoutState({
      ...initialState,
      currentPlan: plan,
      currentDayIndex: dayIndex,
      status: 'playing',
      isExpanded: true,
    });
    const firstExerciseName = plan.days[dayIndex].exercises[0].name;
    speak(t('TTS_START_WORKOUT', { exercise: firstExerciseName }));
  }, [speak, t]);

  const pauseWorkout = () => {
    if (workoutState.status === 'playing') {
      setWorkoutState(prev => ({ ...prev, status: 'paused' }));
    }
  };
  
  const resumeWorkout = () => {
    if (workoutState.status === 'paused') {
      setWorkoutState(prev => ({ ...prev, status: 'playing' }));
    }
  };

  const nextExercise = useCallback(() => {
    if (!workoutState.currentPlan) return;

    const currentDay = workoutState.currentPlan.days[workoutState.currentDayIndex];
    const isLastExercise = workoutState.currentExerciseIndex >= currentDay.exercises.length - 1;

    if (isLastExercise) {
      endWorkout();
    } else {
      const nextIndex = workoutState.currentExerciseIndex + 1;
      setWorkoutState(prev => ({ ...prev, currentExerciseIndex: nextIndex, status: 'playing' }));
      const nextExerciseName = currentDay.exercises[nextIndex].name;
      speak(t('TTS_NEXT_EXERCISE', { exercise: nextExerciseName }));
    }
  }, [workoutState, speak, t]);

  const endWorkout = () => {
    setWorkoutState(initialState);
    speak(t('TTS_END_WORKOUT'));
  };
  
  const toggleExpand = () => {
      setWorkoutState(prev => ({...prev, isExpanded: !prev.isExpanded}));
  };

  const startRest = useCallback(() => {
    if (!workoutState.currentPlan) return;
    const currentExercise = workoutState.currentPlan.days[workoutState.currentDayIndex].exercises[workoutState.currentExerciseIndex];
    const restDuration = parseInt(currentExercise.rest, 10) || 60;

    setWorkoutState(prev => ({ ...prev, status: 'resting', restTimer: restDuration }));
    speak(t('TTS_START_REST', { duration: restDuration.toString() }));

    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    restIntervalRef.current = setInterval(() => {
        setWorkoutState(prev => {
            if (prev.restTimer <= 1) {
                clearInterval(restIntervalRef.current!);
                nextExercise();
                return { ...prev, status: 'playing', restTimer: 0 };
            }
             if (prev.restTimer <= 4) {
                 speak(`${prev.restTimer-1}`);
             }
            return { ...prev, restTimer: prev.restTimer - 1 };
        });
    }, 1000);
  }, [workoutState.currentPlan, workoutState.currentDayIndex, workoutState.currentExerciseIndex, speak, nextExercise, t]);

   useEffect(() => {
    // Cleanup interval on component unmount or workout end
    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, []);

  return (
    <WorkoutContext.Provider value={{ workoutState, startWorkout, pauseWorkout, resumeWorkout, nextExercise, endWorkout, toggleExpand, startRest }}>
      {children}
    </WorkoutContext.Provider>
  );
};