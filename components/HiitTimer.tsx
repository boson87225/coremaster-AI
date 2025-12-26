import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { Activity, Play, Pause, RotateCcw, Flame, Wind, Zap, CheckCircle, Volume2, VolumeX, Music, Crosshair } from './icons';
import { formatTime } from '../utils/time';
import { useTranslation } from '../context/LanguageContext';
import { textToSpeech } from '../services/ttsService';
import { decode, decodeAudioData } from '../utils/audio';
import { BodyAvatar, AvatarAction } from './BodyAvatar';
import { PlanContext } from '../context/PlanContext';
import { getEffectiveApiKey } from '../services/geminiService';

interface HiitTimerProps {
  userId: string | null;
}

type HiitPhase = 'idle' | 'warmup' | 'work' | 'rest' | 'cooldown' | 'finished';

const PHASE_CONFIG = {
    idle: { color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700', label: 'SYSTEM READY', met: 1.5 },
    warmup: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'SYSTEM WARMUP', met: 5 },
    work: { color: 'text-red-500', bg: 'bg-red-600/20', border: 'border-red-500/50', label: 'MAX POWER', met: 11.5 },
    rest: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'RECOVER', met: 3 },
    cooldown: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', label: 'COOL DOWN', met: 4 },
    finished: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', label: 'MISSION COMPLETE', met: 1.5 },
};

// Chinese AI Action Pack - 明確的動作名稱
const WORKOUT_VARIANTS: { action: AvatarAction; label: string; tts: string; target: string }[] = [
    { 
        action: 'boxing', 
        label: '光速拳擊', 
        tts: '保持節奏，快速出拳！', 
        target: 'Upper Body' 
    },
    { 
        action: 'jumping', 
        label: '開合跳', 
        tts: '幅度加大，全身動起來！', 
        target: 'Full Body' 
    },
    { 
        action: 'running', 
        label: '高抬腿衝刺', 
        tts: '膝蓋抬高，全力衝刺！', 
        target: 'Legs / Cardio' 
    },
    { 
        action: 'squat', 
        label: '深蹲跳', 
        tts: '臀部後坐，用力跳起！', 
        target: 'Glutes / Quads' 
    },
    { 
        action: 'lunge', 
        label: '交互弓箭步', 
        tts: '背部挺直，交互下蹲。', 
        target: 'Legs / Balance' 
    },
    { 
        action: 'boxing', 
        label: '格鬥連擊', 
        tts: '想像目標，全力一擊！', 
        target: 'Power / Core' 
    },
];

// High energy Cyberpunk/Techno style music (Stable Link)
const MUSIC_URL = "https://cdn.pixabay.com/audio/2024/09/16/audio_aaa399676e.mp3"; 

export const HiitTimer: React.FC<HiitTimerProps> = ({ userId }) => {
  const { userProfile } = useContext(PlanContext);

  // Settings
  const [warmupTime, setWarmupTime] = useState(30); 
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(15);
  const [cooldownTime, setCooldownTime] = useState(30);
  const [totalCycles, setTotalCycles] = useState(8);

  // UI State
  const [phase, setPhase] = useState<HiitPhase>('idle');
  const [timeLeft, setTimeLeft] = useState(warmupTime);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(12).fill(10));
  
  // Logic Refs (解決狀態更新不同步問題)
  const phaseRef = useRef<HiitPhase>('idle');
  const cycleRef = useRef(1);
  const timeLeftRef = useRef(warmupTime);
  
  // Visual Coach State
  const [avatarAction, setAvatarAction] = useState<AvatarAction>('idle');
  const [currentMoveName, setCurrentMoveName] = useState('等待指令 (Standby)');
  const [currentTarget, setCurrentTarget] = useState('N/A');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const nextStartTimeRef = useRef(0);
  const { t } = useTranslation();

  // --- Audio Visualizer Effect ---
  useEffect(() => {
      let animFrame: number;
      const updateVisualizer = () => {
          if (isRunning && !isPaused) {
              setVisualizerBars(prev => prev.map(() => Math.random() * (phase === 'work' ? 100 : 40)));
          } else {
              setVisualizerBars(new Array(12).fill(5));
          }
          animFrame = requestAnimationFrame(updateVisualizer);
      };
      
      // Throttle visualizer to 10fps for retro feel
      const interval = setInterval(updateVisualizer, 100);
      return () => {
          cancelAnimationFrame(animFrame);
          clearInterval(interval);
      };
  }, [isRunning, isPaused, phase]);

  // --- Audio Engine ---
  const getAudioContext = () => {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return audioContextRef.current;
  };

  // Music Setup
  const initMusic = useCallback(() => {
      if (!musicRef.current) {
          const audio = new Audio(MUSIC_URL);
          audio.loop = true;
          audio.volume = 0.6;
          audio.preload = 'auto';
          musicRef.current = audio;
      }
      return musicRef.current;
  }, []);

  // Music Control Effect
  useEffect(() => {
      const audio = musicRef.current;
      if (!audio) return;

      if (isRunning && !isPaused && !isMuted) {
          audio.volume = phase === 'work' ? 0.8 : 0.3;
          if (audio.paused) {
              const p = audio.play();
              if(p) p.catch(e => console.warn("Auto-play prevented", e));
          }
      } else {
          audio.pause();
      }
  }, [isRunning, isPaused, isMuted, phase]);

  useEffect(() => {
      return () => {
          if (musicRef.current) {
              musicRef.current.pause();
              musicRef.current = null;
          }
          if (intervalRef.current) clearInterval(intervalRef.current);
          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      };
  }, []);

  const playBeep = useCallback((frequency: number, duration: number, volume: number) => {
    if (isMuted) return;
    const context = getAudioContext();
    if (!context) return;
    if (context.state === 'suspended') context.resume().catch(()=>{});

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    gainNode.gain.value = volume;
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);
  }, [isMuted]);

  // --- Hybrid TTS System (AI -> Browser Fallback) ---
  const speak = useCallback(async (text: string) => {
    if (isMuted) return;
    
    // Duck music
    if (musicRef.current) musicRef.current.volume = 0.1;

    let spoken = false;
    const hasKey = !!getEffectiveApiKey();

    // 1. Try Gemini AI TTS (Only if Key exists)
    if (hasKey) {
        try {
            const context = getAudioContext();
            if (context) {
                if (context.state === 'suspended') await context.resume();
                
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000));
                const ttsPromise = textToSpeech(text);
                
                const base64Audio = await Promise.race([ttsPromise, timeoutPromise]) as string | null;

                if (base64Audio) {
                    const audioBuffer = await decodeAudioData(decode(base64Audio), context, 24000, 1);
                    const source = context.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(context.destination);
                    
                    const now = context.currentTime;
                    const startTime = Math.max(now, nextStartTimeRef.current < now ? now : nextStartTimeRef.current);
                    
                    source.start(startTime);
                    nextStartTimeRef.current = startTime + audioBuffer.duration;
                    
                    source.onended = () => {
                        if (musicRef.current && isRunning && !isPaused) {
                            musicRef.current.volume = phaseRef.current === 'work' ? 0.8 : 0.3;
                        }
                    };
                    spoken = true;
                }
            }
        } catch (e) {
            console.warn("AI TTS failed or timed out, falling back to native:", e);
        }
    }

    // 2. Fallback to Browser Native TTS (Immediate if no key, or if AI failed)
    if (!spoken && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Clear queue
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to select a Chinese voice
        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('TW') || v.lang.includes('CN'));
        if (zhVoice) utterance.voice = zhVoice;
        
        utterance.lang = 'zh-TW';
        utterance.rate = 1.2; 
        utterance.volume = 1.0;
        
        utterance.onend = () => {
             if (musicRef.current && isRunning && !isPaused) {
                musicRef.current.volume = phaseRef.current === 'work' ? 0.8 : 0.3;
            }
        };
        
        window.speechSynthesis.speak(utterance);
    } else if (!spoken) {
        // Just restore music if both fail
        setTimeout(() => {
             if (musicRef.current && isRunning && !isPaused) {
                musicRef.current.volume = phaseRef.current === 'work' ? 0.8 : 0.3;
            }
        }, 1000);
    }
  }, [isMuted, isRunning, isPaused]);

  // --- Logic ---
  const calculateCalories = useCallback(() => {
      const weight = userProfile?.weight || 75; 
      const met = PHASE_CONFIG[phaseRef.current].met;
      const kcalPerSecond = (met * 3.5 * weight) / 200 / 60;
      setCaloriesBurned(prev => prev + kcalPerSecond);
  }, [userProfile]);

  // Phase Transition Logic
  const transitionPhase = useCallback((nextPhase: HiitPhase, newCycle?: number) => {
      phaseRef.current = nextPhase;
      setPhase(nextPhase);

      if (newCycle !== undefined) {
          cycleRef.current = newCycle;
          setCurrentCycle(newCycle);
      }

      let nextTime = 0;
      let speech = "";
      
      const activeCycle = cycleRef.current;

      switch (nextPhase) {
          case 'warmup':
              nextTime = warmupTime;
              speech = "訓練開始。先進行熱身。";
              setAvatarAction('running'); 
              setCurrentMoveName('熱身跑 (Warm Up)');
              setCurrentTarget('Cardio / Joints');
              break;
          case 'work':
              nextTime = workTime;
              const variantIndex = (activeCycle - 1) % WORKOUT_VARIANTS.length;
              const variant = WORKOUT_VARIANTS[variantIndex];
              
              setAvatarAction(variant.action);
              setCurrentMoveName(variant.label);
              setCurrentTarget(variant.target);

              speech = activeCycle === totalCycles 
                  ? `最後一組！${variant.label}！全部釋放！`
                  : `開始！${variant.label}。${variant.tts}`;
              break;
          case 'rest':
              nextTime = restTime;
              speech = "停。休息調整呼吸。";
              setAvatarAction('idle');
              setCurrentMoveName('動態恢復 (Recover)');
              setCurrentTarget('Heart Rate');
              break;
          case 'cooldown':
              nextTime = cooldownTime;
              speech = "恭喜完成。開始冷卻放鬆。";
              setAvatarAction('idle'); 
              setCurrentMoveName('冷卻 (Cool Down)');
              setCurrentTarget('Stretch');
              break;
          case 'finished':
              nextTime = 0;
              speech = "訓練結束。你做到了。";
              setIsRunning(false);
              setAvatarAction('waving');
              setCurrentMoveName('訓練完成 (Complete)');
              setCurrentTarget('Done');
              if(musicRef.current) musicRef.current.pause();
              break;
      }
      
      timeLeftRef.current = nextTime;
      setTimeLeft(nextTime);
      speak(speech);
  }, [warmupTime, workTime, restTime, cooldownTime, totalCycles, speak]);

  const tick = useCallback(() => {
    calculateCalories();

    const current = timeLeftRef.current;
    
    // --- Early Voice Announcements (5s before change) ---
    if (current === 6) { 
        const currentPhase = phaseRef.current;
        const currentCyc = cycleRef.current;

        if (currentPhase === 'rest' && currentCyc < totalCycles) {
            const nextIndex = currentCyc % WORKOUT_VARIANTS.length;
            const nextVariant = WORKOUT_VARIANTS[nextIndex];
            speak(`準備下一組：${nextVariant.label}`);
        } else if (currentPhase === 'warmup') {
            const firstVariant = WORKOUT_VARIANTS[0];
            speak(`熱身結束。準備第一組：${firstVariant.label}`);
        }
    }

    // --- Countdown Beeps ---
    if (current === 4) playBeep(440, 100, 0.3); // 3
    if (current === 3) playBeep(440, 100, 0.3); // 2
    if (current === 2) playBeep(440, 100, 0.3); // 1
    if (current === 1) playBeep(880, 400, 0.5); // GO

    // --- Time Decrement ---
    if (current > 1) {
        timeLeftRef.current = current - 1;
        setTimeLeft(current - 1);
    } else {
        // Transition Logic
        const currentPhase = phaseRef.current;
        const currentCyc = cycleRef.current;

        if (currentPhase === 'warmup') {
            transitionPhase('work');
        } 
        else if (currentPhase === 'work') {
            if (currentCyc < totalCycles) {
                transitionPhase('rest');
            } else {
                transitionPhase('cooldown');
            }
        } 
        else if (currentPhase === 'rest') {
            const nextCycle = currentCyc + 1;
            transitionPhase('work', nextCycle);
        } 
        else if (currentPhase === 'cooldown') {
            transitionPhase('finished');
        }
    }
  }, [totalCycles, playBeep, transitionPhase, calculateCalories, speak]);

  const startTimer = () => {
    if (isRunning && !isPaused) return;
    
    // 1. Force Music Play & Audio Context (Must happen in user click handler)
    const audio = initMusic();
    if (!isMuted) {
        audio.play().catch(e => console.warn("Music start blocked", e));
    }
    
    const context = getAudioContext();
    if (context && context.state === 'suspended') {
        context.resume();
    }

    // 2. Unlock Browser TTS (Crucial for Mobile Safari)
    if ('speechSynthesis' in window) {
        const silent = new SpeechSynthesisUtterance(" ");
        silent.volume = 0;
        window.speechSynthesis.speak(silent);
    }

    setIsRunning(true);
    setIsPaused(false);

    if (phase === 'idle' || phase === 'finished') {
        // Reset
        cycleRef.current = 1;
        phaseRef.current = 'warmup';
        setCaloriesBurned(0);
        setCurrentCycle(1);
        transitionPhase('warmup', 1);
    } else {
        speak("繼續訓練。");
        // Resume Avatar Action
        if (phase === 'work') {
             const variantIndex = (cycleRef.current - 1) % WORKOUT_VARIANTS.length;
             setAvatarAction(WORKOUT_VARIANTS[variantIndex].action);
        }
    }
  };

  const pauseTimer = () => {
      setIsPaused(true);
      setIsRunning(false);
      speak("暫停。");
      setAvatarAction('idle');
      if (musicRef.current) musicRef.current.pause();
  };

  const resetTimer = () => {
      setIsRunning(false);
      setIsPaused(false);
      setPhase('idle');
      phaseRef.current = 'idle';
      
      setTimeLeft(warmupTime);
      timeLeftRef.current = warmupTime;
      
      setCurrentCycle(1);
      cycleRef.current = 1;
      
      setCaloriesBurned(0);
      setAvatarAction('idle');
      setCurrentMoveName('等待指令 (Standby)');
      if(musicRef.current) {
          musicRef.current.pause();
          musicRef.current.currentTime = 0;
      }
      
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  useEffect(() => {
      if (isRunning) {
          intervalRef.current = setInterval(tick, 1000);
      }
      return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
      };
  }, [isRunning, tick]);

  // --- Visual Helpers ---
  const currentTotalTime = useMemo(() => {
      if (phase === 'warmup') return warmupTime;
      if (phase === 'work') return workTime;
      if (phase === 'rest') return restTime;
      if (phase === 'cooldown') return cooldownTime;
      return 1;
  }, [phase, warmupTime, workTime, restTime, cooldownTime]);

  const progress = ((currentTotalTime - timeLeft) / currentTotalTime) * 100;
  const radius = 130;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const totalDuration = warmupTime + (totalCycles * (workTime + restTime)) - restTime + cooldownTime;
  
  const avatarProps = {
      gender: userProfile?.gender || 'male',
      weight: userProfile?.weight || 75,
      height: userProfile?.height || 175,
  };

  return (
    <div className={`relative overflow-hidden p-6 rounded-[2.5rem] border transition-all duration-700 max-w-lg mx-auto shadow-2xl ${PHASE_CONFIG[phase].bg} ${PHASE_CONFIG[phase].border}`}>
      
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent)`,
          backgroundSize: '30px 30px'
      }}></div>

      {/* Intense Background Pulse for Work Phase */}
      {phase === 'work' && isRunning && (
          <div className="absolute inset-0 bg-red-600/20 animate-pulse z-0 pointer-events-none mix-blend-overlay"></div>
      )}
      
      {/* 3 Second Warning Pulse */}
      {timeLeft <= 3 && timeLeft > 0 && isRunning && (
          <div className="absolute inset-0 bg-white/20 animate-ping z-0 pointer-events-none"></div>
      )}

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl bg-slate-900/80 border border-white/10 ${phase === 'work' ? 'animate-bounce' : ''}`}>
                {phase === 'warmup' && <Flame className="text-yellow-400" size={18} />}
                {phase === 'work' && <Zap className="text-red-500" size={18} />}
                {phase === 'rest' && <Activity className="text-emerald-400" size={18} />}
                {phase === 'cooldown' && <Wind className="text-indigo-400" size={18} />}
                {(phase === 'idle' || phase === 'finished') && <CheckCircle className="text-slate-400" size={18} />}
            </div>
            <div>
                <h3 className="text-sm font-black text-white italic uppercase tracking-tighter">AI Coach Core</h3>
                <p className={`text-[9px] font-mono font-bold uppercase tracking-widest ${PHASE_CONFIG[phase].color}`}>
                    {phase === 'idle' ? 'Ready to Start' : PHASE_CONFIG[phase].label}
                </p>
            </div>
          </div>
          <div className="flex gap-2">
              <button 
                onClick={() => {
                    setIsMuted(!isMuted);
                    if (musicRef.current) {
                        musicRef.current.muted = !isMuted;
                        // 如果取消靜音且正在運行，嘗試播放
                        if (isMuted && isRunning && !isPaused) musicRef.current.play().catch(console.error);
                    }
                }} 
                className={`p-2 rounded-full border border-white/10 hover:text-white transition-colors ${!isMuted ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-900/50 text-slate-400'}`}
              >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <div className="text-right px-2 py-1 bg-slate-900/50 rounded-lg border border-white/10">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Cycle</p>
                  <p className="text-sm font-black text-white leading-none">
                      {phase === 'idle' || phase === 'finished' ? '--' : `${currentCycle}/${totalCycles}`}
                  </p>
              </div>
          </div>
      </div>

      {/* Main Interface */}
      <div className="relative z-10 flex flex-col items-center justify-center py-4 min-h-[320px]">
          
          {/* AI HUD Overlay Elements */}
          {isRunning && (
              <>
                <div className="absolute top-0 w-full flex justify-between px-4 text-[8px] font-mono text-cyan-500/50 uppercase tracking-widest animate-pulse">
                    <span>Target: {currentTarget}</span>
                    <span>AI_SYNC: ESTABLISHED</span>
                </div>
                {/* Audio Visualizer */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 flex flex-col gap-1 px-2 opacity-50">
                    {visualizerBars.slice(0,6).map((h, i) => (
                        <div key={`l-${i}`} className="w-1 bg-cyan-400 transition-all duration-100" style={{ height: `${h}px` }}></div>
                    ))}
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 flex flex-col gap-1 px-2 opacity-50 items-end">
                    {visualizerBars.slice(6,12).map((h, i) => (
                        <div key={`r-${i}`} className="w-1 bg-cyan-400 transition-all duration-100" style={{ height: `${h}px` }}></div>
                    ))}
                </div>
              </>
          )}

          {/* 1. Holographic Avatar (Scaled Down & Centered) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 mb-8">
             <div className={`transition-all duration-500 transform ${phase === 'work' ? 'scale-[0.65] brightness-125' : 'scale-[0.6] opacity-90'}`}>
                {/* Hologram projection beam effect */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-12 bg-cyan-500/20 blur-xl rounded-[100%]"></div>
                <BodyAvatar 
                    {...avatarProps} 
                    action={avatarAction} 
                    hideBackground={true} 
                    className="w-56 h-64" 
                />
             </div>
          </div>

          {/* 2. Timer Ring (Floating around) */}
          <div className="relative w-[260px] h-[260px] flex items-center justify-center z-10 pointer-events-none">
              <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg] absolute opacity-40">
                  <circle
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth={stroke}
                      fill="transparent"
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                  />
                  <circle
                      stroke="currentColor"
                      strokeWidth={stroke}
                      strokeDasharray={circumference + ' ' + circumference}
                      style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s linear' }}
                      strokeLinecap="round"
                      fill="transparent"
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                      className={PHASE_CONFIG[phase].color}
                  />
              </svg>
              
              {/* 3. Text Overlay (Bottom) */}
              <div className="absolute -bottom-6 flex flex-col items-center justify-center w-full">
                   {/* Move Name Banner */}
                  <div className="mb-2 px-4 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center gap-2">
                      <Crosshair size={12} className="text-cyan-400 animate-spin-slow" />
                      <span className="text-xs font-black text-white uppercase tracking-widest whitespace-nowrap">
                          {currentMoveName}
                      </span>
                  </div>

                  {/* Big Timer */}
                  <span className={`text-6xl font-black font-mono tracking-tighter drop-shadow-2xl ${PHASE_CONFIG[phase].color} relative transition-all duration-200 ${timeLeft <= 3 && timeLeft > 0 ? 'scale-125 text-white' : ''}`}>
                      {formatTime(timeLeft)}
                      {phase === 'work' && <span className="absolute -right-4 top-0 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                  </span>
                  
                  {/* Calorie Counter */}
                  <div className="flex items-center gap-1.5 mt-1 bg-orange-500/10 px-2 py-0.5 rounded text-orange-400 border border-orange-500/20">
                      <Flame size={10} className="animate-pulse" />
                      <span className="text-[10px] font-black font-mono tracking-wider">{caloriesBurned.toFixed(1)} KCAL</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
          {!isRunning || isPaused ? (
              <button 
                  onClick={startTimer} 
                  className={`py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${phase === 'finished' ? 'bg-slate-700 text-slate-400' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'}`}
                  disabled={phase === 'finished'}
              >
                  <Play size={18} fill="currentColor" /> {isPaused ? t('RESUME_BUTTON') : t('START_BUTTON')}
              </button>
          ) : (
              <button onClick={pauseTimer} className="py-4 bg-yellow-500 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-yellow-400 transition-transform active:scale-95">
                  <Pause size={18} fill="currentColor" /> {t('PAUSE_BUTTON')}
              </button>
          )}
          <button onClick={resetTimer} className="py-4 bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-slate-600 transition-transform active:scale-95">
              <RotateCcw size={18} /> {t('RESET_BUTTON')}
          </button>
      </div>

      {/* Settings Panel */}
      <div className={`relative z-10 mt-6 transition-all duration-500 ${isRunning && !isPaused ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
              <Music size={14} className="text-cyan-400" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Training Protocol Setup</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <label className="text-[9px] font-bold text-yellow-400 uppercase block mb-1">Warm Up (s)</label>
                  <input type="number" value={warmupTime} onChange={e => setWarmupTime(Number(e.target.value))} className="w-full bg-transparent text-white font-mono font-bold outline-none" />
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <label className="text-[9px] font-bold text-indigo-400 uppercase block mb-1">Cool Down (s)</label>
                  <input type="number" value={cooldownTime} onChange={e => setCooldownTime(Number(e.target.value))} className="w-full bg-transparent text-white font-mono font-bold outline-none" />
              </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <label className="text-[9px] font-bold text-red-400 uppercase block mb-1">Work (s)</label>
                  <input type="number" value={workTime} onChange={e => setWorkTime(Number(e.target.value))} className="w-full bg-transparent text-white font-mono font-bold outline-none" />
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <label className="text-[9px] font-bold text-emerald-400 uppercase block mb-1">Rest (s)</label>
                  <input type="number" value={restTime} onChange={e => setRestTime(Number(e.target.value))} className="w-full bg-transparent text-white font-mono font-bold outline-none" />
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <label className="text-[9px] font-bold text-cyan-400 uppercase block mb-1">Cycles</label>
                  <input type="number" value={totalCycles} onChange={e => setTotalCycles(Number(e.target.value))} className="w-full bg-transparent text-white font-mono font-bold outline-none" />
              </div>
          </div>
          
          <div className="mt-4 text-center flex justify-between items-center px-2">
              <p className="text-[9px] text-slate-500 font-mono">BGM: CYBERPUNK_DRIVE.mp3</p>
              <p className="text-[9px] text-slate-500 font-mono">EST. DURATION: {formatTime(totalDuration)}</p>
          </div>
      </div>
    </div>
  );
};