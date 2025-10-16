'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface MedicalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  icon?: string;
}

const MedicalInput = forwardRef<HTMLInputElement, MedicalInputProps>(
  ({ label, error, required, icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <input
          ref={ref}
          className={`
            w-full px-4 py-2 rounded-lg border medical-border
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            hover:border-slate-300 transition-colors placeholder:text-sm
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

MedicalInput.displayName = 'MedicalInput';

export default MedicalInput;