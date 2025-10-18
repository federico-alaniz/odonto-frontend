'use client';

import { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface MedicalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  loadingText?: string;
}

export default function MedicalButton({
  children,
  variant = 'primary',
  loading = false,
  loadingText = 'Cargando...',
  className = "",
  disabled,
  ...props
}: MedicalButtonProps) {
  const baseClasses = "inline-flex items-center justify-center px-6 py-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: loading || disabled 
      ? 'bg-gray-400 text-white cursor-not-allowed' 
      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md focus:ring-blue-500',
    secondary: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500'
  };

  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <span className="flex items-center">
          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}