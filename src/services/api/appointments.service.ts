// services/api/appointments.service.ts

import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentFilters,
  AppointmentResponse,
  AppointmentsListResponse,
  AppointmentStatsResponse
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Headers comunes
const getHeaders = (clinicId: string, userId?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Clinic-Id': clinicId,
  };
  
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  
  return headers;
};

class AppointmentsService {
  /**
   * Crear una nueva cita
   */
  async createAppointment(
    clinicId: string,
    userId: string,
    data: CreateAppointmentData
  ): Promise<AppointmentResponse> {
    try {
      const url = `${API_BASE_URL}/api/appointments`;
      const headers = getHeaders(clinicId, userId);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.error || 'Error al crear cita';
        throw new Error(errorMessage);
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error creating appointment:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las citas con filtros
   */
  async getAppointments(
    clinicId: string,
    filters?: AppointmentFilters
  ): Promise<AppointmentsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.doctorId) queryParams.append('doctorId', filters.doctorId);
      if (filters?.patientId) queryParams.append('patientId', filters.patientId);
      if (filters?.fecha) queryParams.append('fecha', filters.fecha);
      if (filters?.fechaInicio) queryParams.append('fechaInicio', filters.fechaInicio);
      if (filters?.fechaFin) queryParams.append('fechaFin', filters.fechaFin);
      if (filters?.estado) queryParams.append('estado', filters.estado);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const url = `${API_BASE_URL}/api/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const headers = getHeaders(clinicId);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al obtener citas');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error fetching appointments:', error);
      throw error;
    }
  }

  /**
   * Obtener una cita por ID
   */
  async getAppointmentById(
    clinicId: string,
    appointmentId: string
  ): Promise<AppointmentResponse> {
    try {
      const url = `${API_BASE_URL}/api/appointments/${appointmentId}`;
      const headers = getHeaders(clinicId);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al obtener cita');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error fetching appointment:', error);
      throw error;
    }
  }

  /**
   * Actualizar una cita
   */
  async updateAppointment(
    clinicId: string,
    userId: string,
    appointmentId: string,
    data: UpdateAppointmentData
  ): Promise<AppointmentResponse> {
    try {
      const url = `${API_BASE_URL}/api/appointments/${appointmentId}`;
      const headers = getHeaders(clinicId, userId);

      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al actualizar cita');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error updating appointment:', error);
      throw error;
    }
  }

  /**
   * Cancelar una cita
   */
  async cancelAppointment(
    clinicId: string,
    userId: string,
    appointmentId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const url = `${API_BASE_URL}/api/appointments/${appointmentId}/cancel`;
      const headers = getHeaders(clinicId, userId);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ reason })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al cancelar cita');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error cancelling appointment:', error);
      throw error;
    }
  }

  /**
   * Obtener agenda del doctor para una fecha específica
   */
  async getDoctorSchedule(
    clinicId: string,
    doctorId: string,
    fecha: string
  ): Promise<{ success: boolean; data: Appointment[] }> {
    try {
      const url = `${API_BASE_URL}/api/appointments/doctor/${doctorId}/schedule?fecha=${fecha}`;
      const headers = getHeaders(clinicId);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al obtener agenda');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error fetching doctor schedule:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de citas
   */
  async getAppointmentStats(
    clinicId: string
  ): Promise<AppointmentStatsResponse> {
    try {
      const url = `${API_BASE_URL}/api/appointments/stats`;
      const headers = getHeaders(clinicId);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al obtener estadísticas');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error fetching stats:', error);
      throw error;
    }
  }
}

export const appointmentsService = new AppointmentsService();
