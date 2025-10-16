'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface MedicalSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  icon?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const MedicalSelect = forwardRef<HTMLSelectElement, MedicalSelectProps>(
  ({ label, error, required, icon, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <select
          ref={ref}
          className={`
            w-full px-4 py-2 rounded-lg border medical-border
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            hover:border-slate-300 transition-colors placeholder:text-sm
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
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

MedicalSelect.displayName = 'MedicalSelect';

export default MedicalSelect;