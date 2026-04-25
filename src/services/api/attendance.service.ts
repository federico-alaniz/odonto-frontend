const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Headers comunes para todas las peticiones
const getHeaders = (clinicId?: string, userId?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (clinicId) headers['X-Clinic-Id'] = clinicId;
  if (userId) headers['X-User-Id'] = userId;
  
  return headers;
};

// Helper para manejar respuestas y errores de forma consistente
const handleResponse = async (response: Response) => {
  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
  }

  if (!response.ok) {
    throw new Error(data.error || data.detail || 'Error en la operación');
  }

  return data;
};

export interface AttendanceStatus {
  isOnline: boolean;
  loginTime?: string;
  sessionId?: string;
}

export interface AttendanceSession {
  id: string;
  doctorId: string;
  clinicId: string;
  loginTime: string;
  logoutTime?: string;
  loggedBy: string;
  createdAt: string;
  updatedAt: string;
}

class AttendanceService {
  /**
   * Registrar login de un doctor
   * POST /api/attendance/login
   */
  async recordLogin(
    doctorId: string,
    clinicId: string,
    userId: string
  ): Promise<{ success: boolean; data?: AttendanceSession; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/attendance/login`, {
        method: 'POST',
        headers: getHeaders(clinicId, userId),
        body: JSON.stringify({ doctorId, clinicId }),
      });

      return await handleResponse(response);
    } catch (error: any) {
      console.error('Error recording login:', error);
      throw error;
    }
  }

  /**
   * Registrar logout de un doctor
   * POST /api/attendance/logout
   */
  async recordLogout(
    doctorId: string,
    clinicId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/attendance/logout`, {
        method: 'POST',
        headers: getHeaders(clinicId, userId),
        body: JSON.stringify({ doctorId, clinicId }),
      });

      return await handleResponse(response);
    } catch (error: any) {
      console.error('Error recording logout:', error);
      throw error;
    }
  }

  /**
   * Obtener estado actual de un doctor específico
   * GET /api/attendance/status/:doctor_id
   */
  async getDoctorStatus(
    doctorId: string,
    clinicId: string
  ): Promise<{ success: boolean; data: AttendanceStatus }> {
    try {
      const response = await fetch(`${API_URL}/api/attendance/status/${doctorId}`, {
        method: 'GET',
        headers: getHeaders(clinicId),
      });

      return await handleResponse(response);
    } catch (error: any) {
      console.error('Error getting doctor status:', error);
      throw error;
    }
  }

  /**
   * Obtener estado de todos los doctores de la clínica
   * GET /api/attendance/status
   */
  async getAllDoctorsStatus(
    clinicId: string
  ): Promise<{ success: boolean; data: Record<string, AttendanceStatus> }> {
    try {
      const response = await fetch(`${API_URL}/api/attendance/status`, {
        method: 'GET',
        headers: getHeaders(clinicId),
      });

      return await handleResponse(response);
    } catch (error: any) {
      console.error('Error getting all doctors status:', error);
      throw error;
    }
  }

  /**
   * Obtener sesiones de hoy (opcional: de un doctor específico)
   * GET /api/attendance/sessions?doctor_id=xxx
   */
  async getTodaySessions(
    clinicId: string,
    doctorId?: string
  ): Promise<{ success: boolean; data: AttendanceSession[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (doctorId) queryParams.append('doctor_id', doctorId);

      const url = `${API_URL}/api/attendance/sessions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(clinicId),
      });

      return await handleResponse(response);
    } catch (error: any) {
      console.error('Error getting today sessions:', error);
      throw error;
    }
  }
}

// Exportar instancia única del servicio
export const attendanceService = new AttendanceService();
