
import React from 'react';

interface TabButtonProps<T extends string> {
  mode: T;
  currentMode: T;
  setMode: (mode: T) => void;
  label: string;
  icon: React.ReactNode;
  activeColor?: string;
}

export const TabButton = <T extends string,>({ 
  mode, 
  currentMode, 
  setMode, 
  label, 
  icon,
  activeColor = 'bg-cyan-400/10 text-cyan-300',
}: TabButtonProps<T>) => (
  <button
    onClick={() => setMode(mode)}
    className={`flex items-center space-x-1 py-2 px-3 rounded-full font-semibold transition duration-200 text-sm md:text-base ${
      currentMode === mode
        ? `${activeColor} shadow-inner`
        : 'text-slate-300 hover:bg-slate-700/50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);