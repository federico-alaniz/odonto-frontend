'use client';

import { InputHTMLAttributes } from 'react';

interface MedicalInputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  error?: string;
  required?: boolean;
  onChange: (value: string) => void;
  value: string;
}

export default function MedicalInputField({
  label,
  error,
  required = false,
  onChange,
  value,
  className = "",
  ...props
}: MedicalInputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && '*'}
      </label>
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}