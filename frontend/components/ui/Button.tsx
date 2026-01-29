import Link from 'next/link';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  children, 
  href, 
  onClick, 
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled = false,
  type = 'button'
}: ButtonProps) {
  const baseStyles = 'font-bold rounded-xl transition-all inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1',
    secondary: 'bg-white text-gray-800 hover:bg-gray-50 border-2 border-gray-300 shadow-sm',
    outline: 'bg-transparent text-primary-600 hover:bg-primary-50 border-2 border-primary-600'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </Link>
    );
  }

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={classes}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}