
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw } from './icons';
import { formatTime } from '../utils/time';
import { useTranslation } from '../context/LanguageContext';

interface LissTimerProps {
  userId: string | null;
}

export const LissTimer: React.FC<LissTimerProps> = ({ userId }) => {
    const [targetDuration, setTargetDuration] = useState<number>(3600);
    const [timeLeft, setTimeLeft] = useState<number>(targetDuration);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const { t } = useTranslation();

    const startTimer = () => {
        if (isRunning) return;
        setIsRunning(true);
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime > 0) {
                    return prevTime - 1;
                }
                clearInterval(intervalRef.current!);
                setIsRunning(false);
                return 0;
            });
        }, 1000);
    };

    const pauseTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
    };

    const resetTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
        setTimeLeft(targetDuration);
    };

    useEffect(() => {
        if (!isRunning) {
            setTimeLeft(targetDuration);
        }
    }, [targetDuration, isRunning]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const isFinished = timeLeft === 0 && !isRunning;

    return (
        <div className="p-4 md:p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl max-w-lg mx-auto space-y-6">
            <h3 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-2 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-cyan-400" /> {t('LISS_TITLE')}
            </h3>
            
            <div className="bg-slate-700/50 p-4 rounded-xl text-center shadow-inner">
                <p className="text-lg md:text-xl font-medium text-cyan-300 mb-2">{t('LISS_TARGET_HR')}</p>
                <p className={`text-5xl md:text-6xl font-mono font-extrabold ${isRunning ? 'text-cyan-200' : 'text-slate-200'}`}>
                    {formatTime(timeLeft)}
                </p>
                <p className="text-base md:text-lg text-slate-400 mt-2">
                    {isFinished ? t('STATUS_COMPLETED') : isRunning ? t('LISS_STATUS_RUNNING') : t('STATUS_READY')}
                </p>
            </div>

            <div className="flex justify-center space-x-4">
                {!isRunning && !isFinished ? (
                    <button 
                        onClick={startTimer}
                        className="flex items-center space-x-2 py-3 px-6 rounded-full font-bold shadow-lg transition transform hover:scale-[1.05] bg-cyan-600 hover:bg-cyan-500 text-white"
                    >
                        <Play className="w-5 h-5" />
                        <span>{t('START_LISS')}</span>
                    </button>
                ) : isRunning ? (
                    <button 
                        onClick={pauseTimer}
                        className="flex items-center space-x-2 py-3 px-6 rounded-full font-bold shadow-lg transition transform hover:scale-[1.05] bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                        <Pause className="w-5 h-5" />
                        <span>{t('PAUSE_BUTTON')}</span>
                    </button>
                ) : (
                    <button 
                        onClick={resetTimer}
                        className="flex items-center space-x-2 py-3 px-6 rounded-full font-bold shadow-lg transition transform hover:scale-[1.05] bg-slate-600 hover:bg-slate-500 text-white"
                    >
                        <RotateCcw className="w-5 h-5" />
                        <span>{t('RESET_BUTTON')}</span>
                    </button>
                )}
            </div>

            <div className="border-t border-slate-700 pt-4">
                <h3 className="text-lg font-semibold text-slate-300 mb-2">{t('LISS_TARGET_TIME_MINUTES')}</h3>
                <div className="flex justify-center">
                    <input
                        type="number"
                        min="1"
                        value={targetDuration / 60}
                        onChange={(e) => setTargetDuration(Math.max(60, parseInt(e.target.value) * 60))}
                        disabled={isRunning}
                        className="p-2 bg-slate-700 border border-slate-600 rounded-lg text-xl text-center font-semibold disabled:bg-slate-800 disabled:text-slate-400 w-32"
                    />
                </div>
                <p className="mt-2 text-sm text-slate-500 text-center">{t('LISS_RECOMMENDATION')}</p>
            </div>
        </div>
    );
};