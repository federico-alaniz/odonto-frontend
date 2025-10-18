'use client';

import { TextareaHTMLAttributes } from 'react';

interface MedicalTextareaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  error?: string;
  required?: boolean;
  onChange: (value: string) => void;
  value: string;
}

export default function MedicalTextareaField({
  label,
  error,
  required = false,
  onChange,
  value,
  className = "",
  rows = 3,
  ...props
}: MedicalTextareaFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && '*'}
      </label>
      <textarea
        {...props}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors resize-y ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}