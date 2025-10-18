'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface MedicalTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const MedicalTextarea = forwardRef<HTMLTextAreaElement, MedicalTextareaProps>(
  ({ label, error, required, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border border-gray-300
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            hover:border-gray-400 transition-colors resize-y placeholder:text-sm
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          rows={4}
          {...props}
        />
        
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

MedicalTextarea.displayName = 'MedicalTextarea';

export default MedicalTextarea;