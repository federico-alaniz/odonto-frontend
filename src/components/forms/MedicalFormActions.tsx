'use client';

import { ReactNode } from 'react';

interface MedicalFormActionsProps {
  children: ReactNode;
  className?: string;
}

export default function MedicalFormActions({
  children,
  className = ""
}: MedicalFormActionsProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}