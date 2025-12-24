import React, { useMemo, useState, useEffect } from 'react';

type AvatarAction = 'idle' | 'waving' | 'pushup' | 'lifting' | 'flexing';

interface BodyAvatarProps {
  gender: 'male' | 'female';
  weight: number;
  height: number;
  focus?: string; 
}

export const BodyAvatar: React.FC<BodyAvatarProps> = ({ gender, weight, height, focus = "" }) => {
  const [currentAction, setCurrentAction] = useState<AvatarAction>('idle');
  const [frame, setFrame] = useState(0); 
  
  const bmi = useMemo(() => {
    if (!height || !weight) return 22;
    const hM = height / 100;
    return weight / (hM * hM);
  }, [weight, height]);

  const morph = useMemo(() => {
    const clamped = Math.min(Math.max(bmi, 15), 35);
    return (clamped - 15) / 20;
  }, [bmi]);

  const category = useMemo(() => {
    if (bmi < 18.5) return { label: 'Lean', theme: '#38bdf8', color: 'cyan' };
    if (bmi < 24) return { label: 'Athletic', theme: '#22d3ee', color: 'cyan' };
    if (bmi < 28) return { label: 'Powerful', theme: '#34d399', color: 'emerald' };
    return { label: 'Massive', theme: '#f59e0b', color: 'amber' };
  }, [bmi]);

  useEffect(() => {
    let timer: number;
    timer = window.setInterval(() => {
      setFrame(f => (f + 2) % 100);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const handleInteraction = () => {
    if (currentAction !== 'idle') return;
    const actions: AvatarAction[] = ['waving', 'pushup', 'lifting', 'flexing'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    setCurrentAction(randomAction);
    setTimeout(() => setCurrentAction('idle'), 4000);
  };

  const w = (base: number, add: number) => base + (add * morph);
  
  // 動態進度 (0-1)
  const progress = Math.sin((frame / 100) * Math.PI * 2) * 0.5 + 0.5;
  const slowPulse = Math.sin((frame / 100) * Math.PI) * 0.5 + 0.5;

  const isSideView = currentAction === 'pushup';

  return (
    <div 
      onClick={handleInteraction}
      className="relative flex flex-col items-center justify-center p-12 bg-slate-950/98 rounded-[4rem] border border-white/10 overflow-hidden cursor-pointer select-none group shadow-[0_0_80px_rgba(0,0,0,0.9)] active:scale-[0.98] transition-all"
    >
      {/* 背景裝飾：全息網格與掃描線 */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20 blur-sm animate-[scan_3s_linear_infinite]"></div>
      
      {/* 能量地基 */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/5 blur-[80px] rounded-full"></div>

      <svg width="280" height="380" viewBox="0 0 120 160" className="relative z-20">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="100%" stopColor={category.theme} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="muscleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`${category.theme}aa`} />
            <stop offset="50%" stopColor={`${category.theme}44`} />
            <stop offset="100%" stopColor={`${category.theme}aa`} />
          </linearGradient>
          <filter id="hyperGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g filter="url(#hyperGlow)">
          {/* 視角切換控制 */}
          {!isSideView ? (
            <g className="transition-all duration-700">
              {/* 正面模式：帶呼吸律動的身體 */}
              <g transform={`translate(0, ${slowPulse * 1.5})`}>
                
                {/* 1. 軀幹：具備層次感的肌肉建模 */}
                <path 
                  d={gender === 'male' 
                    ? `M ${60-w(24,14)},35 Q 60,30 ${60+w(24,14)},35 L ${60+w(16,16)},65 Q 60,70 ${60-w(16,16)},65 Z`
                    : `M ${60-w(18,8)},35 Q 60,32 ${60+w(18,8)},35 C ${60+w(22,6)},45 ${60+w(12,10)},55 ${60+w(13,10)},65 C ${60+w(15,10)},75 ${60+w(22,12)},80 ${60-w(22,12)},80 Z`
                  }
                  fill="url(#muscleGrad)" stroke={category.theme} strokeWidth="0.8" strokeDasharray="100 5"
                />
                
                {/* 腹肌細節 (隨 BMI 增加層次) */}
                <g opacity={0.4 + morph * 0.6} stroke={category.theme} strokeWidth="0.5">
                   {[45, 50, 55].map(y => (
                     <line key={y} x1={60-w(8,4)} y1={y} x2={60+w(8,4)} y2={y} strokeLinecap="round" />
                   ))}
                </g>

                {/* 動力核心 (Reactor) */}
                <g transform="translate(60, 48)">
                   <circle r="4" fill="url(#coreGlow)" className="animate-pulse" />
                   <circle r="6" fill="none" stroke={category.theme} strokeWidth="0.2" strokeDasharray="2 1">
                      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s" repeatCount="indefinite" />
                   </circle>
                </g>

                {/* 2. 手臂系統 (正面) */}
                {/* 左臂 */}
                <path 
                  d={`M ${60-w(24,14)},35 L ${60-w(40,12)},${currentAction==='flexing'?25:55} L ${60-w(30,12)},${currentAction==='flexing'?10:85}`}
                  stroke={category.theme} strokeWidth={w(5,3)} fill="none" strokeLinecap="round" strokeJoin="round"
                />
                {/* 右臂 (揮手動畫) */}
                <path 
                  d={currentAction === 'waving'
                    ? `M ${60+w(24,14)},35 L ${60+w(45,10)},35 L ${60+w(35,10) + Math.sin(frame/5)*8},10`
                    : `M ${60+w(24,14)},35 L ${60+w(40,12)},${currentAction==='flexing'?25:55} L ${60+w(30,12)},${currentAction==='flexing'?10:85}`}
                  stroke={category.theme} strokeWidth={w(5,3)} fill="none" strokeLinecap="round" strokeJoin="round"
                />

                {/* 3. 腿部系統 (正面) */}
                <g transform={`translate(0, ${currentAction==='lifting'&&progress>0.5 ? -5 : 0})`}>
                  <path d={`M ${60-w(14,6)},80 L ${60-w(18,10)},115 L ${60-w(15,8)},150`} stroke={category.theme} strokeWidth={w(7,4)} fill="none" strokeLinecap="round" strokeJoin="round" />
                  <path d={`M ${60+w(14,6)},80 L ${60+w(18,10)},115 L ${60+w(15,8)},150`} stroke={category.theme} strokeWidth={w(7,4)} fill="none" strokeLinecap="round" strokeJoin="round" />
                </g>

                {/* 關節感應點 */}
                <g fill="#fff" opacity="0.8">
                  <circle cx="60" cy="35" r="1" /> {/* 頸 */}
                  <circle cx={60-w(24,14)} cy="35" r="1.2" /> {/* 左肩 */}
                  <circle cx={60+w(24,14)} cy="35" r="1.2" /> {/* 右肩 */}
                </g>
              </g>

              {/* 頭部 (數位眼罩特效) */}
              <g transform={`translate(0, ${slowPulse * 1.2})`}>
                <ellipse cx="60" cy="20" rx="8" ry="10" fill="url(#muscleGrad)" stroke={category.theme} strokeWidth="1" />
                <rect x="54" y="18" width="12" height="1.5" fill={category.theme} className="animate-pulse" />
              </g>
            </g>
          ) : (
            /* --- 側面模式：伏地挺身 (更精細的解剖模擬) --- */
            <g className="transition-all duration-700">
               {/* 能量地面 */}
               <line x1="10" y1="150" x2="110" y2="150" stroke={category.theme} strokeWidth="0.5" strokeDasharray="2 2" />
               
               <g transform={`translate(0, ${28 * progress})`}>
                  {/* 側面軀幹與頭部 */}
                  <path 
                    d={`M 20,145 L 90,105 L 105,95 L 108,105 L 95,115 L 25,150 Z`}
                    fill="url(#muscleGrad)" stroke={category.theme} strokeWidth="1"
                  />
                  <circle cx="110" cy="90" r="7" fill="url(#muscleGrad)" stroke={category.theme} strokeWidth="1" />
                  
                  {/* 手臂 IK 模擬 (肩-肘-腕) */}
                  <g strokeLinecap="round" strokeJoin="round">
                    <path 
                      d={`M 95,108 L ${85 - 15 * progress},${115 + 20 * progress} L 95,150`}
                      stroke={progress > 0.8 ? '#f43f5e' : category.theme} 
                      strokeWidth="5" fill="none"
                    />
                    {/* 發力火花特效 */}
                    {progress > 0.8 && (
                      <g transform="translate(90, 135)" fill="#f43f5e">
                        <circle r="1" className="animate-ping" />
                        <line x1="-3" y1="-3" x2="3" y2="3" stroke="#f43f5e" strokeWidth="0.5" />
                      </g>
                    )}
                  </g>
               </g>
               {/* 足部支點 */}
               <circle cx="20" cy="150" r="2.5" fill={category.theme} />
            </g>
          )}

          {/* 全息數據裝飾 (浮動元件) */}
          <g opacity="0.4" className="pointer-events-none">
            <text x="5" y="15" fontSize="3" fill={category.theme} className="font-mono">SYNC_ID: {Math.floor(frame * 1234)}</text>
            <text x="5" y="20" fontSize="3" fill={category.theme} className="font-mono">LOAD: {(morph * 100).toFixed(1)}%</text>
            <path d="M 100,20 L 115,20 L 115,35" fill="none" stroke={category.theme} strokeWidth="0.3" />
          </g>
        </g>
      </svg>

      {/* 底部數據交互面 */}
      <div className="mt-8 w-full space-y-4 relative z-30">
        <div className="flex gap-4 p-4 glass rounded-3xl border border-white/10 items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Biometric Data</span>
              <span className="text-sm font-black text-white italic tracking-tighter">
                {currentAction === 'idle' ? 'CALIBRATING...' : `ACTUALIZING: ${currentAction.toUpperCase()}`}
              </span>
           </div>
           <div className="h-10 w-px bg-white/10"></div>
           <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[7px] text-slate-500 font-black uppercase">Muscle Density</p>
                <p className={`text-xs font-black text-${category.color}-400`}>{category.label}</p>
              </div>
              <div className={`w-3 h-3 rounded-full bg-${category.color}-500 shadow-[0_0_10px_${category.theme}]`}></div>
           </div>
        </div>

        <div className="flex justify-center items-center gap-2">
           <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping"></div>
           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Neural Link Established</span>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          from { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          to { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
