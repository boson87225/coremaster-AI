
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Play, Pause, RotateCcw } from './icons';
import { formatTime } from '../utils/time';
import { HIIT_WORKOUT_PLAN } from '../constants';
import { useTranslation } from '../context/LanguageContext';

interface HiitTimerProps {
  userId: string | null;
}

export const HiitTimer: React.FC<HiitTimerProps> = ({ userId }) => {
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(10);
  const [cycles, setCycles] = useState(8);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isWorking, setIsWorking] = useState(true);
  const [timeLeft, setTimeLeft] = useState(workTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playBeep = useCallback((frequency: number, duration: number, volume: number) => {
    if (!audioContextRef.current || audioContextRef.current.state === 'suspended') {
      audioContextRef.current?.resume();
    }
    if (!audioContextRef.current) return;
    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    gainNode.gain.value = volume;
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);
  }, []);

  const startTimer = () => {
    // Resume audio context on user interaction
    if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
    }
    if (isRunning && !isPaused) return;

    if (currentCycle > cycles || (!isRunning && !isPaused)) {
      setCurrentCycle(1);
      setIsWorking(true);
      setTimeLeft(workTime);
    }
    setIsPaused(false);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
            if (prevTime > 1) {
                if (prevTime <= 4) playBeep(440, 100, 0.5);
                return prevTime - 1;
            }
            // Time's up, transition
            if (isWorking) {
                playBeep(880, 500, 0.8);
                setIsWorking(false);
                return restTime;
            } else {
                const nextCycle = currentCycle + 1;
                if (nextCycle <= cycles) {
                    playBeep(660, 200, 0.7);
                    setCurrentCycle(nextCycle);
                    setIsWorking(true);
                    return workTime;
                } else {
                    playBeep(1200, 1000, 1.0);
                    setIsRunning(false);
                    setCurrentCycle(nextCycle);
                    clearInterval(intervalRef.current!);
                    return 0;
                }
            }
        });
    }, 1000);
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentCycle(1);
    setIsWorking(true);
    setTimeLeft(workTime);
  };
  
  useEffect(() => {
    if(!isRunning && !isPaused) {
        setTimeLeft(workTime);
    }
  }, [workTime, isRunning, isPaused]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const totalTime = cycles * (workTime + restTime);
  const cycleTime = isWorking ? workTime : restTime;
  const progressPercentage = cycleTime > 0 ? ((cycleTime - timeLeft) / cycleTime) * 100 : 0;
  const isFinished = currentCycle > cycles;

  const currentAction = HIIT_WORKOUT_PLAN[(currentCycle - 1) % HIIT_WORKOUT_PLAN.length];
  const nextAction = HIIT_WORKOUT_PLAN[currentCycle % HIIT_WORKOUT_PLAN.length];

  return (
    <div className="p-4 md:p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl max-w-lg mx-auto">
      <h3 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-2 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-cyan-400" /> {t('HIIT_TITLE')}
      </h3>
      
      <div className={`text-center my-4 transition-colors duration-500 ${isWorking && isRunning ? 'bg-red-900/30 p-2 rounded-lg' : isRunning ? 'bg-green-900/30 p-2 rounded-lg' : 'p-2'}`}>
        <p className="text-sm font-medium text-slate-400">
            {isFinished ? t('HIIT_RELAX') : (isWorking && isRunning) ? t('HIIT_CURRENT_ACTION') : t('HIIT_NEXT_ACTION')}
        </p>
        <p className={`text-2xl font-extrabold ${isWorking && isRunning ? 'text-red-300' : 'text-slate-200'}`}>
          {isFinished ? t('HIIT_WORKOUT_ENDED') : (isWorking || !isRunning) ? currentAction : nextAction}
        </p>
      </div>

      <div className={`p-4 md:p-8 rounded-xl shadow-inner mb-6 transition-colors duration-500 ${isWorking && isRunning ? 'bg-red-500/10' : isRunning ? 'bg-green-500/10' : isFinished ? 'bg-cyan-500/10' : 'bg-slate-700/50'}`}>
        <p className={`text-xl font-medium ${isWorking ? 'text-red-400' : 'text-green-400'} mb-2`}>
          {isFinished ? t('STATUS_COMPLETED') : isWorking ? t('HIIT_WORK') : t('HIIT_REST')}
        </p>
        <p className={`text-6xl md:text-7xl font-mono font-extrabold ${isWorking ? 'text-red-300' : 'text-green-300'}`}>
          {formatTime(timeLeft)}
        </p>
        <p className="text-lg text-slate-400 mt-2">
          {isFinished ? t('HIIT_WORKOUT_ENDED') : t('HIIT_CYCLE_COUNT', { current: currentCycle, total: cycles })}
        </p>
      </div>
      
      {!isFinished && isRunning && (
        <div className="w-full bg-slate-700 rounded-full h-2.5 mb-6">
          <div 
            className={`h-2.5 rounded-full transition-all duration-1000 ease-linear ${isWorking ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      )}

      <div className="flex justify-center space-x-4 mb-8">
        {!isRunning || isPaused ? (
          <button onClick={startTimer} disabled={isFinished} className={`flex items-center space-x-2 py-3 px-6 rounded-full font-bold shadow-lg transition transform hover:scale-[1.05] ${isFinished ? 'bg-slate-600 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}>
            <Play className="w-5 h-5" />
            <span>{isPaused ? t('RESUME_BUTTON') : t('START_BUTTON')}</span>
          </button>
        ) : (
          <button onClick={pauseTimer} className="flex items-center space-x-2 py-3 px-6 rounded-full font-bold shadow-lg transition transform hover:scale-[1.05] bg-yellow-500 hover:bg-yellow-600 text-white">
            <Pause className="w-5 h-5" />
            <span>{t('PAUSE_BUTTON')}</span>
          </button>
        )}
        <button onClick={resetTimer} className="flex items-center space-x-2 py-3 px-6 rounded-full font-bold shadow-lg transition transform hover:scale-[1.05] bg-slate-600 hover:bg-slate-500 text-white">
          <RotateCcw className="w-5 h-5" />
          <span>{t('RESET_BUTTON')}</span>
        </button>
      </div>
      
      <div className="border-t border-slate-700 pt-4">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">{t('HIIT_SETTINGS')}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="work" className="text-sm font-medium text-slate-400">{t('HIIT_WORK')}</label>
            <input id="work" type="number" value={workTime} onChange={(e) => setWorkTime(Math.max(1, parseInt(e.target.value)))} disabled={isRunning || isPaused} className="mt-1 p-2 bg-slate-700 border border-slate-600 rounded-lg text-lg w-full text-center font-semibold disabled:bg-slate-800 disabled:text-slate-400"/>
          </div>
          <div>
            <label htmlFor="rest" className="text-sm font-medium text-slate-400">{t('HIIT_REST')}</label>
            <input id="rest" type="number" value={restTime} onChange={(e) => setRestTime(Math.max(1, parseInt(e.target.value)))} disabled={isRunning || isPaused} className="mt-1 p-2 bg-slate-700 border border-slate-600 rounded-lg text-lg w-full text-center font-semibold disabled:bg-slate-800 disabled:text-slate-400"/>
          </div>
          <div>
            <label htmlFor="cycles" className="text-sm font-medium text-slate-400">{t('HIIT_CYCLES')}</label>
            <input id="cycles" type="number" value={cycles} onChange={(e) => setCycles(Math.max(1, parseInt(e.target.value)))} disabled={isRunning || isPaused} className="mt-1 p-2 bg-slate-700 border border-slate-600 rounded-lg text-lg w-full text-center font-semibold disabled:bg-slate-800 disabled:text-slate-400"/>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-400 text-center">{t('HIIT_TOTAL_TIME')}: {formatTime(totalTime)}</p>
      </div>
    </div>
  );
};