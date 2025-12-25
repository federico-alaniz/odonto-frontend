'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ActiveConsultation {
  appointmentId: string;
  patientId: string;
  patientName: string;
  startTime: Date;
}

interface ConsultationContextType {
  activeConsultation: ActiveConsultation | null;
  startConsultation: (appointmentId: string, patientId: string, patientName: string) => void;
  endConsultation: () => void;
  isConsultationActive: boolean;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export function ConsultationProvider({ children }: { children: React.ReactNode }) {
  const [activeConsultation, setActiveConsultation] = useState<ActiveConsultation | null>(null);

  const startConsultation = useCallback((appointmentId: string, patientId: string, patientName: string) => {
    setActiveConsultation({
      appointmentId,
      patientId,
      patientName,
      startTime: new Date()
    });
  }, []);

  const endConsultation = useCallback(() => {
    setActiveConsultation(null);
  }, []);

  const isConsultationActive = activeConsultation !== null;

  return (
    <ConsultationContext.Provider
      value={{
        activeConsultation,
        startConsultation,
        endConsultation,
        isConsultationActive
      }}
    >
      {children}
    </ConsultationContext.Provider>
  );
}

export function useConsultation() {
  const context = useContext(ConsultationContext);
  if (context === undefined) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
}
