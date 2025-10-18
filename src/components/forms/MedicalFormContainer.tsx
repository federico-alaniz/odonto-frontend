'use client';

import { ReactNode, FormHTMLAttributes } from 'react';

interface MedicalFormContainerProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'className'> {
  children: ReactNode;
  className?: string;
}

export default function MedicalFormContainer({
  children,
  className = "",
  ...props
}: MedicalFormContainerProps) {
  return (
    <form {...props} className={`max-w-4xl mx-auto space-y-8 ${className}`}>
      {children}
    </form>
  );
}