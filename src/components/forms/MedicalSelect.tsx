'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface MedicalSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const MedicalSelect = forwardRef<HTMLSelectElement, MedicalSelectProps>(
  ({ label, error, required, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <select
          ref={ref}
          className={`
            w-full px-4 py-3 h-12 rounded-lg border border-gray-300
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            hover:border-gray-400 transition-colors
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
          <p className="text-sm text-red-600 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

MedicalSelect.displayName = 'MedicalSelect';

export default MedicalSelect;