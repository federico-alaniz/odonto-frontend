const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Ausencia {
  id: string;
  clinicId: string;
  doctorId: string;
  doctorName: string;
  tipo: 'sin_aviso' | 'licencia' | 'vacaciones' | 'razones_particulares' | 'fuerza_mayor';
  fechaInicio: string;
  fechaFin?: string;
  descripcion: string;
  aprobado: boolean;
  aprobadoPor?: string;
  aprobadoEn?: string;
  documentoAdjunto?: string;
  creadoPor?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface CreateAusenciaData {
  doctorId: string;
  doctorName?: string;
  tipo: 'sin_aviso' | 'licencia' | 'vacaciones' | 'razones_particulares' | 'fuerza_mayor';
  fechaInicio: string;
  fechaFin?: string;
  descripcion?: string;
  documentoAdjunto?: string;
}

export interface AusenciaFilters {
  doctorId?: string;
  tipo?: string;
  aprobado?: boolean;
  activas?: boolean;
  fechaInicio?: string;
  fechaFin?: string;
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

class AusenciasService {
  async getAusencias(clinicId: string, filters?: AusenciaFilters) {
    const params = new URLSearchParams();
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.aprobado !== undefined) params.append('aprobado', String(filters.aprobado));
    if (filters?.activas !== undefined) params.append('activas', String(filters.activas));
    if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
    if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);

    const queryString = params.toString();
    const url = `${API_URL}/api/ausencias${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(clinicId),
    });

    return handleResponse(response);
  }

  async getAusenciaById(clinicId: string, ausenciaId: string) {
    const response = await fetch(`${API_URL}/api/ausencias/${ausenciaId}`, {
      method: 'GET',
      headers: getHeaders(clinicId),
    });

    return handleResponse(response);
  }

  async createAusencia(clinicId: string, data: CreateAusenciaData, userId?: string) {
    const response = await fetch(`${API_URL}/api/ausencias`, {
      method: 'POST',
      headers: getHeaders(clinicId, userId),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  }

  async updateAusencia(clinicId: string, ausenciaId: string, data: Partial<CreateAusenciaData>, userId?: string) {
    const response = await fetch(`${API_URL}/api/ausencias/${ausenciaId}`, {
      method: 'PUT',
      headers: getHeaders(clinicId, userId),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  }

  async approveAusencia(clinicId: string, ausenciaId: string, userId: string) {
    const response = await fetch(`${API_URL}/api/ausencias/${ausenciaId}/approve`, {
      method: 'PATCH',
      headers: getHeaders(clinicId, userId),
    });

    return handleResponse(response);
  }

  async rejectAusencia(clinicId: string, ausenciaId: string) {
    const response = await fetch(`${API_URL}/api/ausencias/${ausenciaId}/reject`, {
      method: 'PATCH',
      headers: getHeaders(clinicId),
    });

    return handleResponse(response);
  }

  async deleteAusencia(clinicId: string, ausenciaId: string) {
    const response = await fetch(`${API_URL}/api/ausencias/${ausenciaId}`, {
      method: 'DELETE',
      headers: getHeaders(clinicId),
    });

    return handleResponse(response);
  }
}

export const ausenciasService = new AusenciasService();
