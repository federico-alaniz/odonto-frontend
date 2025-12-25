'use client';

import { useConsultation } from '@/contexts/ConsultationContext';
import ConsultationTimer from './ConsultationTimer';
import { appointmentsService } from '@/services/api/appointments.service';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';

export default function ConsultationTimerWrapper() {
  const { activeConsultation, endConsultation } = useConsultation();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  if (!activeConsultation) {
    return null;
  }

  const handleFinishConsultation = async () => {
    const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
    const userId = (currentUser as any)?.id;
    
    if (!clinicId || !userId) {
      showError('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    try {
      const response = await appointmentsService.updateAppointment(
        clinicId,
        userId,
        activeConsultation.appointmentId,
        { estado: 'completada' }
      );

      if (response.success) {
        showSuccess('Consulta finalizada', 'La consulta se ha completado exitosamente');
        endConsultation();
      } else {
        throw new Error(response.message || 'Error al finalizar la consulta');
      }
    } catch (error: any) {
      console.error('Error finalizando consulta:', error);
      showError('Error', error.message || 'No se pudo finalizar la consulta');
    }
  };

  return (
    <ConsultationTimer
      appointmentId={activeConsultation.appointmentId}
      patientName={activeConsultation.patientName}
      startTime={activeConsultation.startTime}
      onFinish={handleFinishConsultation}
      onClose={endConsultation}
    />
  );
}
