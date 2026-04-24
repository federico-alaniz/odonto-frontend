const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UserSettings {
  notificacionesEmail: boolean;
  notificacionesPush: boolean;
  notificacionesCitas: boolean;
  sesionExpira: string;
}

export interface UserSettingsUpdate {
  notificacionesEmail?: boolean;
  notificacionesPush?: boolean;
  notificacionesCitas?: boolean;
  sesionExpira?: string;
}

class UserSettingsService {
  async getSettings(clinicId: string, userId: string): Promise<{ success: boolean; data: UserSettings }> {
    try {
      const response = await fetch(`${API_URL}/api/user-settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Clinic-Id': clinicId,
          'X-User-Id': userId,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener configuración');
      }

      return data;
    } catch (error: any) {
      console.error('Error al obtener configuración de usuario:', error);
      throw new Error(error.message || 'Error al obtener configuración de usuario');
    }
  }

  async updateSettings(clinicId: string, userId: string, settings: UserSettingsUpdate): Promise<{ success: boolean; message: string; data: UserSettings }> {
    try {
      const response = await fetch(`${API_URL}/api/user-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Clinic-Id': clinicId,
          'X-User-Id': userId,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar configuración');
      }

      return data;
    } catch (error: any) {
      console.error('Error al actualizar configuración de usuario:', error);
      throw new Error(error.message || 'Error al actualizar configuración de usuario');
    }
  }
}

export const userSettingsService = new UserSettingsService();
