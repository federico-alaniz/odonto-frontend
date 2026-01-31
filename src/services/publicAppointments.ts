const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface PatientData {
  numeroDocumento: string;
  tipoDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  genero: string;
}

export interface AppointmentData {
  doctorId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}

export interface Doctor {
  id: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  especialidades: string[];
  avatar?: string;
  nextAvailable: string | null;
}

export interface TimeSlot {
  horaInicio: string;
  horaFin: string;
}

export interface AvailableSlots {
  [date: string]: TimeSlot[];
}

export const publicAppointmentsService = {
  async checkPatient(numeroDocumento: string, clinicId: string) {
    const response = await fetch(`${API_URL}/api/public/appointments/check-patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ numeroDocumento, clinicId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al verificar paciente');
    }

    return response.json();
  },

  async getDoctors(clinicId: string): Promise<{ success: boolean; data: Doctor[] }> {
    const response = await fetch(`${API_URL}/api/public/doctors?clinicId=${clinicId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener doctores');
    }

    return response.json();
  },

  async getAvailableSlots(
    doctorId: string,
    clinicId: string,
    startDate: string,
    endDate: string
  ): Promise<{ success: boolean; data: AvailableSlots }> {
    const response = await fetch(
      `${API_URL}/api/public/doctors/${doctorId}/available-slots?clinicId=${clinicId}&startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener horarios disponibles');
    }

    return response.json();
  },

  async createAppointment(
    clinicId: string,
    patient: PatientData,
    appointment: AppointmentData
  ) {
    const response = await fetch(`${API_URL}/api/public/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clinicId,
        patient,
        appointment,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear turno');
    }

    return response.json();
  },
};
