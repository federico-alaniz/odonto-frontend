'use client';

import { ReactNode } from 'react';

interface MedicalFieldGroupProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export default function MedicalFieldGroup({
  children,
  columns = 2,
  className = ""
}: MedicalFieldGroupProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}