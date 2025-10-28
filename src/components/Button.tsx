import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'text-white',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg',
    danger: 'bg-red-600 text-white hover:bg-red-700 rounded-lg',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  // Special gradient container for primary buttons
  if (variant === 'primary') {
    return (
      <div className={`gradient-button-container ${widthClass} ${className}`}>
        <button
          className={`${baseStyles} ${sizes[size]} gradient-button`}
          {...props}
        >
          {children}
        </button>
      </div>
    );
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

