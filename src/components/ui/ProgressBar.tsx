import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, max, color = 'bg-red-500' }) => {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  return (
    <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${percent}%` }} />
    </div>
  );
};
