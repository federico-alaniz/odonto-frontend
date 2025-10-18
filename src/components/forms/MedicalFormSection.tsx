'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface MedicalFormSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  children: ReactNode;
  className?: string;
}

export default function MedicalFormSection({
  title,
  description,
  icon: Icon,
  iconColor,
  children,
  className = ""
}: MedicalFormSectionProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}