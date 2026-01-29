import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  variant?: 'white' | 'gray' | 'gradient' | 'primary';
}

export function Section({ children, className = '', variant = 'white' }: SectionProps) {
  const variants = {
    white: 'bg-white',
    gray: 'bg-gradient-to-br from-gray-50 to-gray-100',
    gradient: 'bg-gradient-to-br from-primary-50 to-primary-100',
    primary: 'relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden'
  };

  return (
    <section className={`py-20 md:py-28 ${variants[variant]} ${className}`}>
      {variant === 'primary' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {children}
      </div>
    </section>
  );
}