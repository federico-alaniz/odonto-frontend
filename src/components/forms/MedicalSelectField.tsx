'use client';

import { SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface MedicalSelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  options: Option[];
  error?: string;
  required?: boolean;
  onChange: (value: string) => void;
  value: string;
  placeholder?: string;
}

export default function MedicalSelectField({
  label,
  options,
  error,
  required = false,
  onChange,
  value,
  placeholder = "Seleccione una opción",
  className = "",
  ...props
}: MedicalSelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && '*'}
      </label>
      <select
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}