const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types
export interface MedicalSpecialty {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface ConsultingRoom {
  id: string;
  number: string;
  name: string;
  floor: string;
  capacity: number;
  equipment: string[];
  active: boolean;
}

export interface OperatingRoom {
  id: string;
  number: string;
  name: string;
  floor: string;
  type: string;
  equipment: string[];
  active: boolean;
}

export interface GeneralSettings {
  clinicName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  timezone: string;
  language: string;
  logo: string | null;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  reminderHoursBefore: number;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiration: number;
}

export interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  theme: 'light' | 'dark';
}

export interface ClinicSettings {
  clinicId: string;
  generalSettings: GeneralSettings;
  specialties: MedicalSpecialty[];
  consultingRooms: ConsultingRoom[];
  operatingRooms: OperatingRoom[];
  notifications: NotificationSettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicSettingsResponse {
  success: boolean;
  data: ClinicSettings;
}

export interface SpecialtiesResponse {
  success: boolean;
  data: MedicalSpecialty[];
}

// Helper function to get headers
const getHeaders = (clinicId: string, userId?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Clinic-Id': clinicId,
  };
  
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  
  return headers;
};

export const clinicSettingsService = {
  /**
   * Get all clinic settings
   */
  async getSettings(clinicId: string): Promise<ClinicSettingsResponse> {
    try {
      const url = `${API_BASE_URL}/api/clinic-settings`;
      const headers = getHeaders(clinicId);

      console.log('🔍 Obteniendo configuración de la clínica...');

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al obtener configuración');
      }

      console.log('✅ Configuración obtenida');
      return responseData;
    } catch (error: any) {
      console.error('❌ Error fetching clinic settings:', error);
      throw error;
    }
  },

  /**
   * Update clinic settings
   */
  async updateSettings(
    clinicId: string,
    settings: Partial<ClinicSettings>,
    userId: string
  ): Promise<ClinicSettingsResponse> {
    try {
      const url = `${API_BASE_URL}/api/clinic-settings`;
      const headers = getHeaders(clinicId, userId);

      console.log('💾 Actualizando configuración...');

      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(settings)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al actualizar configuración');
      }

      console.log('✅ Configuración actualizada');
      return responseData;
    } catch (error: any) {
      console.error('❌ Error updating clinic settings:', error);
      throw error;
    }
  },

  /**
   * Get specialties
   */
  async getSpecialties(clinicId: string): Promise<SpecialtiesResponse> {
    try {
      const url = `${API_BASE_URL}/api/clinic-settings/specialties`;
      const headers = getHeaders(clinicId);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al obtener especialidades');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error fetching specialties:', error);
      throw error;
    }
  },

  /**
   * Update specialties
   */
  async updateSpecialties(
    clinicId: string,
    specialties: MedicalSpecialty[],
    userId: string
  ): Promise<ClinicSettingsResponse> {
    try {
      const url = `${API_BASE_URL}/api/clinic-settings/specialties`;
      const headers = getHeaders(clinicId, userId);

      console.log('💾 Actualizando especialidades...');

      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(specialties)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al actualizar especialidades');
      }

      console.log('✅ Especialidades actualizadas');
      return responseData;
    } catch (error: any) {
      console.error('❌ Error updating specialties:', error);
      throw error;
    }
  },

  /**
   * Get consulting rooms
   */
  async getConsultingRooms(clinicId: string): Promise<{ success: boolean; data: ConsultingRoom[] }> {
    try {
      const url = `${API_BASE_URL}/api/clinic-settings/consulting-rooms`;
      const headers = getHeaders(clinicId);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al obtener consultorios');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error fetching consulting rooms:', error);
      throw error;
    }
  },

  /**
   * Update consulting rooms
   */
  async updateConsultingRooms(
    clinicId: string,
    rooms: ConsultingRoom[],
    userId: string
  ): Promise<ClinicSettingsResponse> {
    try {
      const url = `${API_BASE_URL}/api/clinic-settings/consulting-rooms`;
      const headers = getHeaders(clinicId, userId);

      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(rooms)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al actualizar consultorios');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error updating consulting rooms:', error);
      throw error;
    }
  },

  /**
   * Get operating rooms
   */
  async getOperatingRooms(clinicId: string): Promise<{ success: boolean; data: OperatingRoom[] }> {
    try {
      const url = `${API_BASE_URL}/api/clinic-settings/operating-rooms`;
      const headers = getHeaders(clinicId);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al obtener quirófanos');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error fetching operating rooms:', error);
      throw error;
    }
  },

  /**
   * Update operating rooms
   */
  async updateOperatingRooms(
    clinicId: string,
    rooms: OperatingRoom[],
    userId: string
  ): Promise<ClinicSettingsResponse> {
    try {
      const url = `${API_BASE_URL}/api/clinic-settings/operating-rooms`;
      const headers = getHeaders(clinicId, userId);

      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(rooms)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al actualizar quirófanos');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error updating operating rooms:', error);
      throw error;
    }
  }
};
