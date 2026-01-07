const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Aviso {
  id: string;
  clinicId: string;
  doctorId: string;
  doctorName: string;
  mensaje: string;
  tipo: 'informativo' | 'urgente' | 'recordatorio';
  fecha: string;
  hora: string;
  leido: boolean;
  creadoPor?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface CreateAvisoData {
  doctorId: string;
  doctorName?: string;
  mensaje: string;
  tipo?: 'informativo' | 'urgente' | 'recordatorio';
  fecha?: string;
  hora?: string;
}

export interface AvisoFilters {
  doctorId?: string;
  tipo?: string;
  leido?: boolean;
  fecha?: string;
}

const getHeaders = (clinicId?: string, userId?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (clinicId) headers['X-Clinic-Id'] = clinicId;
  if (userId) headers['X-User-Id'] = userId;
  
  return headers;
};

const handleResponse = async (response: Response) => {
  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('Error de conexión con el servidor');
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Error en la petición');
  }

  return data;
};

class AvisosService {
  async getAvisos(clinicId: string, filters?: AvisoFilters) {
    const params = new URLSearchParams();
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.leido !== undefined) params.append('leido', String(filters.leido));
    if (filters?.fecha) params.append('fecha', filters.fecha);

    const queryString = params.toString();
    const url = `${API_URL}/api/avisos${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(clinicId),
    });

    return handleResponse(response);
  }

  async getAvisoById(clinicId: string, avisoId: string) {
    const response = await fetch(`${API_URL}/api/avisos/${avisoId}`, {
      method: 'GET',
      headers: getHeaders(clinicId),
    });

    return handleResponse(response);
  }

  async createAviso(clinicId: string, data: CreateAvisoData, userId?: string) {
    const response = await fetch(`${API_URL}/api/avisos`, {
      method: 'POST',
      headers: getHeaders(clinicId, userId),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  }

  async updateAviso(clinicId: string, avisoId: string, data: Partial<CreateAvisoData>, userId?: string) {
    const response = await fetch(`${API_URL}/api/avisos/${avisoId}`, {
      method: 'PUT',
      headers: getHeaders(clinicId, userId),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  }

  async markAsRead(clinicId: string, avisoId: string) {
    const response = await fetch(`${API_URL}/api/avisos/${avisoId}/read`, {
      method: 'PATCH',
      headers: getHeaders(clinicId),
    });

    return handleResponse(response);
  }

  async deleteAviso(clinicId: string, avisoId: string) {
    const response = await fetch(`${API_URL}/api/avisos/${avisoId}`, {
      method: 'DELETE',
      headers: getHeaders(clinicId),
    });

    return handleResponse(response);
  }
}

export const avisosService = new AvisosService();
