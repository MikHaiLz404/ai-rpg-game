import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-gray-800 rounded-xl p-4 border-2 border-amber-500/30 ${onClick ? 'cursor-pointer hover:border-amber-500 transition-all' : ''} ${className}`}
  >
    {children}
  </div>
);
