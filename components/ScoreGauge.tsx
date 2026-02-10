import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface ScoreGaugeProps {
  score: number;
  label: string;
  color?: string;
  onClick?: () => void;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, label, color, onClick }) => {
  const data = [{ name: 'score', value: score }];
  
  // Determine color based on score if not overridden explicitly
  let finalColor = color;
  
  if (!finalColor) {
    if (score >= 90) finalColor = '#10b981'; // Green
    else if (score >= 50) finalColor = '#f59e0b'; // Orange
    else finalColor = '#ef4444'; // Red
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-slate-100 transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-indigo-200 hover:scale-[1.02]' : ''}`}
      style={onClick ? { cursor: 'pointer' } : undefined}
      onClick={onClick}
    >
      <div className="relative w-32 h-32">
        <RadialBarChart
          width={128}
          height={128}
          cx={64}
          cy={64}
          innerRadius={40}
          outerRadius={56}
          barSize={10}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            fill={finalColor}
          />
        </RadialBarChart>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`text-2xl font-bold`} style={{ color: finalColor }}>{score}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-slate-600 flex items-center gap-1">
        {label}
        {onClick && <span className="text-xs text-slate-400 font-normal">(Details)</span>}
      </span>
    </div>
  );
};

export default ScoreGauge;