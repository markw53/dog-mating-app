import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div className={`
      bg-white rounded-2xl shadow-md border border-gray-100 p-6
      ${hover ? 'hover:shadow-xl hover:-translate-y-2 transition-all duration-300' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}