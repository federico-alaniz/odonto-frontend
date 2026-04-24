import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-b-2',
  xl: 'h-16 w-16 border-b-2'
};

const colorClasses = {
  primary: 'border-blue-600',
  white: 'border-white',
  gray: 'border-gray-600'
};

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}) => {
  return (
    <div 
      className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Cargando"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Aguarde un instante...', 
  size = 'lg' 
}) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`w-12 h-12 border-4 border-gray-200 rounded-full`}></div>
          <div className={`absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent`}></div>
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};
