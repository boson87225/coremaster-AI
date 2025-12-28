
import React, { useState } from 'react';
import { Sparkles, Zap, BrainCircuit, X, ChevronRight, Activity, Bot, Target, ShieldCheck } from './icons';

export const AppIntroSlides: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [slide, setSlide] = useState(0);

    const slides = [
        {
            title: "NEURAL CORE SYNC",
            subtitle: "下一代 AI 健身協議",
            desc: "CoreMaster 不僅僅是紀錄工具。它透過 Gemini 3.0 神經網絡實時感知您的進步。無論是體重跳動、飲食攝取還是專項表現，AI 將為您打造動態同步的數位孿生大腦。",
            icon: <BrainCircuit className="text-cyan-400" size={64} />,
            color: "from-cyan-500/20 to-indigo-500/20",
            features: ["即時數據同步", "AI 體態分析", "動態營養調整"]
        },
        {
            title: "ELITE PROTOCOLS",
            subtitle: "職業級專項訓練庫",
            desc: "從格鬥家到馬拉松跑者，我們預設了 12 類職業級專項訓練。每一項都包含科學的 3 日循環：爆發力突破、專項肌力強化、以及神經肌肉修復。讓您在業餘賽場展現職業表現。",
            icon: <Zap className="text-yellow-400" size={64} />,
            color: "from-yellow-500/20 to-orange-500/20",
            features: ["12 項專項運動", "科學 3 日循環", "爆發與耐力雙修"]
        }
    ];

    const current = slides[slide];

    return (
        <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col p-6 animate-fade-in font-sans">
            <div className={`flex-grow rounded-[3.5rem] border border-white/10 bg-gradient-to-br ${current.color} flex flex-col items-center justify-center text-center p-8 space-y-8 relative overflow-hidden shadow-2xl`}>
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-30"></div>
                <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="relative z-10 animate-bounce duration-1000">
                    <div className="p-6 bg-slate-900/80 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                        {current.icon}
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    <h1 className="text-5xl font-black text-white italic tracking-tighter leading-none drop-shadow-lg">{current.title}</h1>
                    <div className="inline-block px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">{current.subtitle}</p>
                    </div>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-xs relative z-10">
                    {current.desc}
                </p>

                <div className="grid grid-cols-1 gap-2 w-full max-w-[200px] relative z-10 pt-4">
                    {current.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2 bg-black/30 rounded-xl border border-white/5 text-[10px] font-bold text-slate-300">
                            <ShieldCheck size={14} className="text-cyan-500" /> {f}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 mt-8 relative z-10">
                    {slides.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${slide === i ? 'w-10 bg-cyan-500' : 'w-2 bg-white/10'}`}></div>
                    ))}
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <button onClick={onClose} className="flex-1 py-5 rounded-[2.5rem] border border-white/10 text-slate-500 font-black uppercase text-[11px] tracking-widest hover:bg-white/5 transition-all">Skip Intro</button>
                <button 
                    onClick={() => slide === slides.length - 1 ? onClose() : setSlide(s => s + 1)}
                    className="flex-[2] py-5 rounded-[2.5rem] bg-white text-slate-950 font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform"
                >
                    {slide === slides.length - 1 ? "Initialize Protocol" : "Access Next Node"} <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};
