
import React from 'react';
import type { WeightLogItem } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface WeightChartProps {
  data: WeightLogItem[];
}

export const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  const { t } = useTranslation();
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-700/50 rounded-lg">
        <p className="text-slate-400 text-center">{t('CHART_NO_DATA')}</p>
      </div>
    );
  }

  // Sort data from oldest to newest for charting
  const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

  const width = 300;
  const height = 150;
  const padding = { top: 20, right: 15, bottom: 20, left: 30 };

  const weights = sortedData.map(d => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = Math.max(1, maxWeight - minWeight); // Avoid division by zero

  // X-axis scale (index-based)
  const xScale = (index: number) => {
    return padding.left + (index / (sortedData.length - 1)) * (width - padding.left - padding.right);
  };

  // Y-axis scale (weight-based)
  const yScale = (weight: number) => {
    return height - padding.bottom - ((weight - minWeight) / weightRange) * (height - padding.top - padding.bottom);
  };
  
  const pathData = sortedData
    .map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.weight);
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');

  const yAxisLabels = () => {
    const labels = [];
    const numLabels = 4;
    for (let i = 0; i < numLabels; i++) {
        const weight = minWeight + (weightRange / (numLabels - 1)) * i;
        labels.push(weight.toFixed(1));
    }
    return labels;
  }

  return (
    <div className="bg-slate-700/50 p-2 rounded-lg">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Y-Axis Grid Lines and Labels */}
            {yAxisLabels().map((label, i) => (
                <g key={i} className="text-slate-500">
                    <line 
                        x1={padding.left} 
                        y1={yScale(parseFloat(label))} 
                        x2={width - padding.right} 
                        y2={yScale(parseFloat(label))}
                        stroke="currentColor"
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                    />
                    <text x={padding.left - 4} y={yScale(parseFloat(label)) + 3} textAnchor="end" fontSize="8" fill="currentColor">
                        {label}
                    </text>
                </g>
            ))}

            {/* Path */}
            <path d={pathData} fill="none" stroke="#22d3ee" strokeWidth="2" />

            {/* Data Points */}
            {sortedData.map((point, index) => (
                <circle 
                    key={index} 
                    cx={xScale(index)} 
                    cy={yScale(point.weight)} 
                    r="3" 
                    fill="#0f172a" 
                    stroke="#22d3ee" 
                    strokeWidth="1.5"
                />
            ))}
        </svg>
    </div>
  );
};