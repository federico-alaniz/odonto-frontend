const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface HistoriaClinica {
  id: string;
  clinicId: string;
  pacienteId: string;
  numeroHistoriaClinica: string;
  
  // Secciones de la historia clínica
  consultas: any[];
  diagnosticos: any[];
  tratamientos: any[];
  prescripciones: any[];
  estudios: any[];
  laboratorios: any[];
  vacunas: any[];
  hospitalizaciones: any[];
  cirugias: any[];
  notasEvolucion: any[];
  
  // Auditoría
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

class HistoriaClinicaService {
  private baseUrl = `${API_BASE_URL}/api/patients`;

  private async fetchWithHeaders(url: string, options: RequestInit = {}) {
    const clinicId = (localStorage.getItem('clinicId') || 'clinic_001').toLowerCase();
    const userId = localStorage.getItem('userId') || 'system';
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Clinic-Id': clinicId,
      'X-User-Id': userId,
      ...options.headers,
    };

    console.log('🔍 Fetching Historia Clínica:', url);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('✅ Response status:', response.status);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ errors: ['Error en la solicitud'] }));
        throw new Error(error.errors?.[0] || 'Error en la solicitud');
      }

      return response.json();
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  }

  /**
   * Get historia clínica for a specific patient
   */
  async getByPatientId(patientId: string): Promise<{ success: boolean; data?: HistoriaClinica; errors?: string[] }> {
    return this.fetchWithHeaders(`${this.baseUrl}/${patientId}/historia-clinica`);
  }
}

export const historiaClinicaService = new HistoriaClinicaService();
export default historiaClinicaService;
