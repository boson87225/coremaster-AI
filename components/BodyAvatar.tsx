import React, { useMemo, useState, useEffect } from 'react';

// Expanded Action List for Full Coverage
export type AvatarAction = 
  'idle' | 'waving' | 'running' | 'jumping' | 
  'squat' | 'lunge' | 'deadlift' | 
  'pushup' | 'press' | 'bench' |
  'pullup' | 'row' | 
  'curl' | 'extension' | 'lateral' | 'shrug' |
  'plank' | 'crutches';

interface BodyAvatarProps {
  gender: 'male' | 'female';
  weight: number;
  height: number;
  focus?: string; 
  action?: AvatarAction;
  hideBackground?: boolean;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export const BodyAvatar: React.FC<BodyAvatarProps> = ({ 
  gender, 
  weight, 
  height, 
  focus = "", 
  action, 
  hideBackground = false,
  className = ""
}) => {
  const [internalAction, setInternalAction] = useState<AvatarAction>('idle');
  const [frame, setFrame] = useState(0); 
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const currentAction = action || internalAction;

  // Initialize Particles with more variety
  useEffect(() => {
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 120,
      y: Math.random() * 160,
      size: Math.random() * 1.5 + 0.2,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.4
    }));
    setParticles(newParticles);
  }, []);

  // Animation Loop - Higher fidelity
  useEffect(() => {
    let timer: number;
    timer = window.setInterval(() => {
      setFrame(f => (f + 1) % 360);
      setParticles(prev => prev.map(p => ({
        ...p,
        y: p.y - p.speed < 0 ? 160 : p.y - p.speed,
        opacity: Math.max(0, Math.min(0.6, p.opacity + (Math.random() - 0.5) * 0.05))
      })));
    }, 20); // 50fps
    return () => clearInterval(timer);
  }, []);

  const handleInteraction = () => {
    if (action) return; 
    if (currentAction !== 'idle') return;
    const actions: AvatarAction[] = ['waving', 'flexing' as any, 'squat', 'lateral', 'curl'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    setInternalAction(randomAction);
    setTimeout(() => setInternalAction('idle'), 4000);
  };

  // --- Theme Engine ---
  const bmi = useMemo(() => (!height || !weight) ? 22 : weight / ((height/100)**2), [weight, height]);
  const morph = useMemo(() => (Math.min(Math.max(bmi, 18), 32) - 18) / 14, [bmi]);

  const style = useMemo(() => {
    if (bmi < 20) return { theme: '#38bdf8', secondary: '#0369a1', glow: '#bae6fd' }; // Speed/Agility (Blue)
    if (bmi < 25) return { theme: '#22d3ee', secondary: '#0e7490', glow: '#a5f3fc' }; // Hybrid (Cyan)
    if (bmi < 29) return { theme: '#34d399', secondary: '#047857', glow: '#6ee7b7' }; // Strength (Green)
    return { theme: '#fbbf24', secondary: '#b45309', glow: '#fde68a' }; // Power (Amber)
  }, [bmi]);

  // --- Animation Cycles ---
  const breath = Math.sin((frame / 60) * Math.PI) * 0.5 + 0.5; 
  const liftCycle = (Math.sin((frame / 40) * Math.PI) + 1) / 2; // 0 to 1
  const fastCycle = (Math.sin((frame / 20) * Math.PI) + 1) / 2;
  const runCycle = Math.sin((frame / 25) * Math.PI);
  
  // Vertical body shift for legs
  const squatOffset = (['squat', 'lunge'].includes(currentAction)) ? breath * 25 : 0;
  const jumpOffset = currentAction === 'jumping' ? Math.abs(Math.sin((frame / 40) * Math.PI)) * -30 : 0;
  const verticalShift = squatOffset + jumpOffset;

  // View Logic
  const isSideView = ['pushup', 'bench', 'crutches', 'running', 'plank', 'lunge', 'row', 'deadlift'].includes(currentAction);

  // --- Geometry Helpers ---
  const w = (base: number, add: number) => base + (add * morph);

  const generateLimbPath = (x1: number, y1: number, x2: number, y2: number, w1: number, w2: number) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const dx1 = w1 * sin;
    const dy1 = w1 * cos;
    const dx2 = w2 * sin;
    const dy2 = w2 * cos;
    return `M ${x1 - dx1},${y1 + dy1} L ${x1 + dx1},${y1 - dy1} L ${x2 + dx2},${y2 - dy2} L ${x2 - dx2},${y2 + dy2} Z`;
  };

  // --- Components ---
  
  const CyberLimb = ({ x1, y1, x2, y2, widthStart, widthEnd, isMuscle = false }: any) => {
    const d = generateLimbPath(x1, y1, x2, y2, widthStart/2, widthEnd/2);
    // Calculate length for flow animation
    const len = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
    
    return (
      <g>
        {/* Glow Layer */}
        <path d={d} fill={style.secondary} opacity="0.15" filter="url(#glow)" />
        {/* Armor Shell */}
        <path d={d} fill="url(#armorGradient)" stroke={style.theme} strokeWidth="0.5" />
        {/* Energy Flow Line (Animated) */}
        {isMuscle && (
             <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={style.glow} strokeWidth="1" strokeDasharray={`${len} ${len}`} strokeDashoffset={frame % (len*2) - len} opacity="0.4" strokeLinecap="round" />
        )}
        {/* Detail Tech Pattern */}
        {isMuscle && <path d={d} fill="url(#techHex)" opacity="0.2" />}
      </g>
    );
  };

  const TechJoint = ({ cx, cy, r }: { cx: number, cy: number, r: number }) => (
    <g transform={`translate(${cx}, ${cy})`}>
      {/* Outer Housing */}
      <circle r={r} fill="#0f172a" stroke={style.theme} strokeWidth="1" />
      {/* Inner Rotating Mechanism */}
      <g transform={`rotate(${frame * 3})`}>
          <path d={`M -${r*0.6},0 L ${r*0.6},0`} stroke={style.secondary} strokeWidth="1" />
          <path d={`M 0,-${r*0.6} L 0,${r*0.6}`} stroke={style.secondary} strokeWidth="1" />
      </g>
      {/* Center Pivot */}
      <circle r={r * 0.3} fill={style.glow} />
    </g>
  );

  const CoreReactor = () => (
      <g transform="translate(60, 42)">
          {/* Base */}
          <circle r="6" fill="#0f172a" stroke={style.secondary} strokeWidth="1" />
          {/* Rotating Rings */}
          <circle r="4.5" fill="none" stroke={style.theme} strokeWidth="1" strokeDasharray="4 2" opacity="0.8">
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle r="3" fill="none" stroke={style.glow} strokeWidth="0.5" strokeDasharray="2 2" opacity="1">
              <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Core Light */}
          <circle r="2" fill={style.glow} filter="url(#glow)" className="animate-pulse" />
      </g>
  );

  // --- Front View Kinematics ---
  const getFrontCoords = (side: 'left' | 'right') => {
      const isLeft = side === 'left';
      const dir = isLeft ? -1 : 1;
      
      // Base Anatomy
      const shoulderX = 60 + (dir * w(20, 10)); 
      const shoulderY = 35;
      
      let elbowX, elbowY, handX, handY;
      
      // --- Action Logic ---
      
      if (currentAction === 'curl') {
          // Bicep Curl: Elbows fixed, hands move up/down
          elbowX = 60 + (dir * w(22, 5));
          elbowY = 65;
          handX = elbowX + (dir * 5);
          handY = 65 - (liftCycle * 35);
      } 
      else if (currentAction === 'press') {
          // Overhead Press: Hands start at shoulder, go up
          const pressH = liftCycle * 50;
          elbowX = 60 + (dir * (w(26, 5) - liftCycle * 5)); 
          elbowY = 35 - (liftCycle * 15);
          handX = 60 + (dir * 10);
          handY = 35 - pressH;
      }
      else if (currentAction === 'pullup') {
          // Pull Up/Lat Pulldown: Hands start high, pull elbows down
          const pullP = liftCycle; // 0 (down) to 1 (up)
          // When 1 (up/start): Hands high, elbows high. When 0 (down/contract): Elbows to ribs.
          // Note: liftCycle goes 0->1->0. 
          // Let's invert for pull action: 0 is hang, 1 is chin over bar.
          // Actually liftCycle oscillates.
          elbowX = 60 + (dir * (25 + pullP * 10)); // Elbows flare out when up
          elbowY = 50 - (pullP * 25); // Elbows go up
          handX = 60 + (dir * (35 + pullP * 5));
          handY = 20 - (pullP * 40); // Hands go way up
      }
      else if (currentAction === 'lateral') {
          // Lateral Raise: Arms lift to side (T-pose)
          const latP = liftCycle; // 0 down, 1 up
          elbowX = shoulderX + (dir * (10 + latP * 25));
          elbowY = 35 + (20 * (1-latP)); // 35 is shoulder height
          handX = shoulderX + (dir * (15 + latP * 45));
          handY = 35 + (45 * (1-latP));
      }
      else if (currentAction === 'extension') {
          // Tricep Pushdown: Upper arm fixed at side, forearm goes down
          elbowX = 60 + (dir * w(18, 5));
          elbowY = 60;
          handX = elbowX + (dir * 5);
          handY = 60 + (25 * liftCycle); // 0 (90deg) to 1 (straight)
      }
      else if (currentAction === 'shrug') {
          // Shrugs: Shoulders move up
          // We can't move shoulderX/Y easily without breaking context, 
          // so we simulate by moving arms up slightly while shoulders stay (or visually hack it)
          // Better: Move the whole arm assembly up
          elbowX = 60 + (dir * 22);
          elbowY = 60 - (liftCycle * 5);
          handX = 60 + (dir * 25);
          handY = 85 - (liftCycle * 8);
      }
      else if (currentAction === 'jumping') {
          elbowX = 60 + (dir * 30);
          elbowY = 30;
          handX = 60 + (dir * 45);
          handY = 10;
      }
      else if (currentAction === 'waving' && !isLeft) {
          elbowX = shoulderX + 20;
          elbowY = 30;
          handX = shoulderX + 15 + Math.sin(frame/10)*5;
          handY = 10;
      }
      else {
          // Idle / Standby
          elbowX = 60 + (dir * w(24, 4));
          elbowY = 60;
          handX = 60 + (dir * w(22, 4));
          handY = 85;
      }

      return { shoulderX, shoulderY, elbowX, elbowY, handX, handY };
  };

  return (
    <div 
      onClick={handleInteraction}
      className={`relative flex flex-col items-center justify-center overflow-hidden transition-all ${
        hideBackground 
          ? '' 
          : 'p-10 bg-slate-950/90 rounded-[3rem] border border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.6)] cursor-pointer group select-none'
      } ${className}`}
    >
      {!hideBackground && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90"></div>
          {/* Hex Grid Background */}
          <div className="absolute inset-0 opacity-10" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='40' viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c5.523 0 10-4.477 10-10V10c0-5.523 4.477-10 10-10s10 4.477 10 10v20c0 5.523-4.477 10-10 10S0 34.477 0 40z' fill='${encodeURIComponent(style.theme)}' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}></div>
        </>
      )}

      <svg width="100%" height="100%" viewBox="0 0 120 160" className="relative z-20 pointer-events-none overflow-visible">
        <defs>
          <linearGradient id="armorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <pattern id="techHex" width="8" height="8" patternUnits="userSpaceOnUse">
             <path d="M4 0l4 2v4l-4 2-4-2V2z" stroke={style.theme} strokeWidth="0.2" fill="none" />
          </pattern>
          <filter id="glow">
             <feGaussianBlur stdDeviation="2" result="coloredBlur" />
             <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
             </feMerge>
          </filter>
        </defs>

        {/* --- Particles --- */}
        {!hideBackground && particles.map(p => (
            <circle key={p.id} cx={p.x} cy={p.y} r={p.size} fill={style.theme} opacity={p.opacity} />
        ))}

        {/* --- Main Avatar Group --- */}
        <g transform={`translate(0, ${breath * 1 + verticalShift})`}>
          
          {!isSideView ? (
            /* ========== FRONT VIEW ========== */
            <g>
                {/* 1. Torso Complex */}
                {/* Spine Connector */}
                <path d="M 60,30 L 60,75" stroke={style.secondary} strokeWidth="6" strokeLinecap="round" opacity="0.5" />
                
                {/* Armor Plates - Traps */}
                <path d={`M 60,30 L ${60-w(12,5)},32 L ${60+w(12,5)},32 Z`} fill="#1e293b" stroke={style.theme} strokeWidth="0.5" />

                {/* Chest Plates (Pecs) */}
                <path d={`M 59,32 L ${60-w(18,10)},35 L ${60-w(12,6)},55 L 59,50 Z`} fill="url(#armorGradient)" stroke={style.theme} strokeWidth="0.5" />
                <path d={`M 61,32 L ${60+w(18,10)},35 L ${60+w(12,6)},55 L 61,50 Z`} fill="url(#armorGradient)" stroke={style.theme} strokeWidth="0.5" />

                {/* Abs (Six Pack Geometry) */}
                <g transform="translate(0, 52)">
                    {[0, 6, 12].map((off, i) => (
                        <g key={i}>
                            <path d={`M 59,${off} L ${60-w(8,3) + i},${off} L 59,${off+5} Z`} fill={style.secondary} opacity="0.6" />
                            <path d={`M 61,${off} L ${60+w(8,3) - i},${off} L 61,${off+5} Z`} fill={style.secondary} opacity="0.6" />
                        </g>
                    ))}
                </g>

                <CoreReactor />

                {/* 2. Head (Helmet) */}
                <g transform="translate(60, 16)">
                    <path d="M -9,-6 L -7,10 L 0,14 L 7,10 L 9,-6 L 6,-12 L -6,-12 Z" fill="#0f172a" stroke={style.theme} strokeWidth="1" />
                    <path d="M -7,0 L 7,0 L 5,6 L -5,6 Z" fill={style.glow} filter="url(#glow)" opacity="0.9">
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                    </path>
                    <rect x="-11" y="-4" width="2" height="8" fill={style.secondary} rx="1" />
                    <rect x="9" y="-4" width="2" height="8" fill={style.secondary} rx="1" />
                </g>

                {/* 3. Arms (Dynamic) */}
                {['left', 'right'].map((side) => {
                    const coords = getFrontCoords(side as 'left'|'right');
                    return (
                        <g key={side}>
                            {/* Deltoid Armor (Shoulder Cap) */}
                            <path d={`M ${coords.shoulderX},${coords.shoulderY-5} l -8,8 l 8,12 l 8,-12 z`} fill="url(#armorGradient)" stroke={style.theme} strokeWidth="0.5" />
                            
                            {/* Upper Arm */}
                            <CyberLimb 
                                x1={coords.shoulderX} y1={coords.shoulderY} 
                                x2={coords.elbowX} y2={coords.elbowY} 
                                widthStart={w(10, 6)} widthEnd={w(7, 4)} 
                                isMuscle={true} 
                            />
                            
                            <TechJoint cx={coords.elbowX} cy={coords.elbowY} r={3} />

                            {/* Forearm */}
                            <CyberLimb 
                                x1={coords.elbowX} y1={coords.elbowY} 
                                x2={coords.handX} y2={coords.handY} 
                                widthStart={w(7, 4)} widthEnd={w(5, 2)} 
                                isMuscle={true} 
                            />
                            
                            {/* Hand */}
                            <g transform={`translate(${coords.handX}, ${coords.handY})`}>
                                <rect x="-3" y="-3" width="6" height="6" rx="1" fill={style.theme} />
                            </g>
                        </g>
                    )
                })}

                {/* 4. Legs */}
                {(() => {
                   const hLx = 60 - w(10, 5);
                   const hRx = 60 + w(10, 5);
                   const hY = 70;
                   let kLx, kLy, fLx, fLy;
                   let kRx, kRy, fRx, fRy;

                   // Leg Logic
                   if (currentAction === 'squat') {
                       // Deep Squat
                       kLx = hLx - 12; kLy = 105; fLx = hLx - 2; fLy = 145;
                       kRx = hRx + 12; kRy = 105; fRx = hRx + 2; fRy = 145;
                   } else if (currentAction === 'jumping') {
                       kLx = hLx - 6; kLy = 105; fLx = hLx; fLy = 135;
                       kRx = hRx + 6; kRy = 105; fRx = hRx; fRy = 135;
                   } else {
                       kLx = hLx - 4; kLy = 110; fLx = hLx - 4; fLy = 150;
                       kRx = hRx + 4; kRy = 110; fRx = hRx + 4; fRy = 150;
                   }

                   return (
                     <g>
                        {/* Pelvis/Hips */}
                        <path d={`M ${hLx},65 L ${hRx},65 L 60,85 Z`} fill="url(#armorGradient)" stroke={style.theme} strokeWidth="0.5" />
                        
                        {/* Left Leg */}
                        <CyberLimb x1={hLx} y1={hY} x2={kLx} y2={kLy} widthStart={w(13,6)} widthEnd={w(9,5)} isMuscle={true} />
                        <TechJoint cx={kLx} cy={kLy} r={4} />
                        <CyberLimb x1={kLx} y1={kLy} x2={fLx} y2={fLy} widthStart={w(9,5)} widthEnd={w(6,3)} isMuscle={true} />
                        
                        {/* Right Leg */}
                        <CyberLimb x1={hRx} y1={hY} x2={kRx} y2={kRy} widthStart={w(13,6)} widthEnd={w(9,5)} isMuscle={true} />
                        <TechJoint cx={kRx} cy={kRy} r={4} />
                        <CyberLimb x1={kRx} y1={kRy} x2={fRx} y2={fRy} widthStart={w(9,5)} widthEnd={w(6,3)} isMuscle={true} />
                        
                        {/* Feet */}
                        <path d={`M ${fLx-4},${fLy} L ${fLx+4},${fLy} L ${fLx},${fLy+4} Z`} fill={style.theme} />
                        <path d={`M ${fRx-4},${fRy} L ${fRx+4},${fRy} L ${fRx},${fRy+4} Z`} fill={style.theme} />
                     </g>
                   )
                })()}
            </g>
          ) : (
            /* ========== SIDE VIEW ========== */
            <g>
               <line x1="20" y1="155" x2="100" y2="155" stroke={style.theme} strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />

               {(currentAction === 'pushup' || currentAction === 'plank' || currentAction === 'bench') && (
                  <g transform={`translate(0, ${currentAction==='plank' ? 30 : 25*breath})`}>
                      {/* Torso */}
                      <CyberLimb x1={25} y1={150} x2={95} y2={115} widthStart={8} widthEnd={14} isMuscle />
                      
                      {/* Head */}
                      <g transform="translate(105, 105)">
                         <path d="M -6,0 L 6,0 L 4,5 L -4,5 Z" fill="#0f172a" stroke={style.theme} />
                         <rect x="0" y="2" width="5" height="2" fill={style.glow} />
                      </g>

                      {/* Arms */}
                      {currentAction === 'plank' ? (
                          <g>
                             <CyberLimb x1={90} y1={115} x2={90} y2={145} widthStart={6} widthEnd={4} />
                             <line x1={90} y1={145} x2={110} y2={145} stroke={style.secondary} strokeWidth="3" />
                          </g>
                      ) : (
                          // Pushup / Bench motion
                          <g>
                             <CyberLimb x1={90} y1={115} x2={85 - 10*breath} y2={125 + 15*breath} widthStart={8} widthEnd={6} />
                             <TechJoint cx={85 - 10*breath} cy={125 + 15*breath} r={3} />
                             <CyberLimb x1={85 - 10*breath} y1={125 + 15*breath} x2={90} y2={155} widthStart={6} widthEnd={4} />
                          </g>
                      )}
                  </g>
               )}

               {currentAction === 'lunge' && (
                  <g transform={`translate(40, ${squatOffset * 0.5})`}>
                      <CyberLimb x1={10} y1={145} x2={30} y2={100} widthStart={4} widthEnd={8} isMuscle />
                      <path d="M 25,50 L 35,50 L 33,100 L 27,100 Z" fill="url(#armorGradient)" stroke={style.theme} strokeWidth="0.5" />
                      <g transform="translate(30, 38)"><circle r="7" fill="#0f172a" stroke={style.theme} /></g>
                      <CyberLimb x1={30} y1={100} x2={50} y2={145} widthStart={8} widthEnd={5} isMuscle />
                      <line x1={30} y1={55} x2={30} y2={90} stroke={style.secondary} strokeWidth="3" />
                  </g>
               )}

               {(currentAction === 'deadlift' || currentAction === 'row') && (
                   <g transform="translate(45, 0)">
                       <g transform={`rotate(${currentAction === 'row' ? 45 : liftCycle * 50}, 0, 90)`}>
                          <path d="M -8,90 L 8,90 L 10,40 L -10,40 Z" fill="url(#armorGradient)" stroke={style.theme} strokeWidth="0.5" />
                          <g transform="translate(0, 30)"><circle r="7" fill="#0f172a" stroke={style.theme} /></g>
                          <g transform={`translate(0, 40) rotate(${currentAction === 'row' ? 0 : -liftCycle * 50})`}> 
                             {currentAction === 'row' ? (
                                <g>
                                    <line x1={0} y1={0} x2={-10 + liftCycle*15} y2={50 - liftCycle*10} stroke={style.secondary} strokeWidth="4" />
                                    <circle cx={-10 + liftCycle*15} cy={50 - liftCycle*10} r={5} fill="#555" stroke="white" />
                                </g>
                             ) : (
                                <g>
                                    <line x1={0} y1={0} x2={0} y2={55} stroke={style.secondary} strokeWidth="4" />
                                    <line x1={-20} y1={55} x2={20} y2={55} stroke="white" strokeWidth="2" />
                                    <circle cx={-15} cy={55} r={5} fill="#333" stroke="white" />
                                    <circle cx={15} cy={55} r={5} fill="#333" stroke="white" />
                                </g>
                             )}
                          </g>
                       </g>
                       <CyberLimb x1={0} y1={90} x2={5} y2={145} widthStart={10} widthEnd={6} isMuscle />
                       <TechJoint cx={0} cy={90} r={4} />
                   </g>
               )}
               
               {currentAction === 'running' && (
                  <g transform="translate(35, 45)">
                     <g transform="rotate(10)">
                        <path d="M -8,-5 L 8,-5 L 6,-45 L -6,-45 Z" fill="url(#armorGradient)" stroke={style.theme} strokeWidth="0.5" />
                        <g transform="translate(0, -55)"><circle r="7" fill="#0f172a" stroke={style.theme} /></g>
                        <path d={`M 0,-40 L ${-10 - runCycle * 15},${-25} L ${-5 - runCycle * 25},${-10}`} stroke={style.secondary} strokeWidth="4" fill="none" strokeLinecap="round" />
                     </g>
                     <g>
                       <CyberLimb x1={0} y1={0} x2={-15 + Math.sin(frame/20 * Math.PI)*20} y2={45} widthStart={8} widthEnd={5} isMuscle />
                       <CyberLimb x1={-15 + Math.sin(frame/20 * Math.PI)*20} y1={45} x2={-25 + Math.sin(frame/20 * Math.PI)*30} y2={80} widthStart={5} widthEnd={3} isMuscle />
                       
                       <CyberLimb x1={0} y1={0} x2={15 - Math.sin(frame/20 * Math.PI)*20} y2={45} widthStart={8} widthEnd={5} isMuscle />
                       <CyberLimb x1={15 - Math.sin(frame/20 * Math.PI)*20} y1={45} x2={25 - Math.sin(frame/20 * Math.PI)*30} y2={80} widthStart={5} widthEnd={3} isMuscle />
                     </g>
                  </g>
               )}
            </g>
          )}

          {/* --- HUD Data Overlay --- */}
          {!hideBackground && (
             <g className="font-mono text-[4px] fill-current" style={{ color: style.theme }}>
                 <text x="5" y="10" fontWeight="bold">STATUS: ENGAGED</text>
                 <text x="5" y="16">OUTPUT: {Math.floor(breath * 100)}%</text>
                 <text x="85" y="10" fontWeight="bold">SYNTH_ID: {Math.floor(frame * 99).toString(16).toUpperCase()}</text>
                 <rect x="5" y="20" width="30" height="0.5" fill={style.theme} />
                 
                 {/* Rotating HUD Element */}
                 <g transform="translate(100, 140)">
                     <circle r="12" fill="none" stroke={style.theme} strokeWidth="0.2" strokeDasharray="2 1" opacity="0.5">
                         <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite" />
                     </circle>
                     <text x="-6" y="1">LOAD:{(morph*100).toFixed(0)}</text>
                 </g>
             </g>
          )}

        </g>
      </svg>

      {/* --- DOM Label --- */}
      {!hideBackground && (
        <div className="mt-8 w-full space-y-3 relative z-30">
          <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/5 shadow-2xl">
             <div className="flex flex-col">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Protocol</span>
                <span className="text-xs font-black text-white tracking-widest uppercase truncate max-w-[100px]" style={{ color: style.theme, textShadow: `0 0 10px ${style.theme}` }}>
                   {currentAction}
                </span>
             </div>
             <div className="h-6 w-px bg-white/10"></div>
             <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Type</span>
                <div className="flex items-center gap-1.5">
                   <span className="text-[10px] font-bold text-white">{style.secondary === '#0369a1' ? 'AGI' : style.secondary === '#0e7490' ? 'HYB' : style.secondary === '#047857' ? 'STR' : 'PWR'}</span>
                   <div className="w-2 h-2 rounded-sm rotate-45 animate-pulse" style={{ backgroundColor: style.theme }}></div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};