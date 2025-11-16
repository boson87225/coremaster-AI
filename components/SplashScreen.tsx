import React from 'react';
import { Dumbbell } from './icons';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-[100] animate-fade-out animation-delay-2000">
      <div className="animate-pulse">
        <Dumbbell className="w-24 h-24 text-cyan-400" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-wide mt-6 opacity-0 animate-fade-in animation-delay-500">
        CoreMaster Fitness
      </h1>
    </div>
  );
};
