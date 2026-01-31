/**
 * Servicio para configuración de email
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface EmailConfig {
  id?: string;
  clinicId?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailConfigResponse {
  success: boolean;
  data?: EmailConfig;
  message?: string;
  error?: string;
}

export interface TestEmailRequest {
  testEmail: string;
}

export interface TestEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class EmailConfigService {
  /**
   * Obtener configuración de email de la clínica
   */
  async getConfig(clinicId: string): Promise<EmailConfigResponse> {
    try {
      const response = await fetch(`${API_URL}/api/email-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Clinic-Id': clinicId,
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error al obtener configuración de email:', error);
      throw new Error(error.message || 'Error al obtener configuración de email');
    }
  }

  /**
   * Guardar configuración de email
   */
  async saveConfig(
    clinicId: string,
    userId: string,
    config: Partial<EmailConfig>
  ): Promise<EmailConfigResponse> {
    try {
      const response = await fetch(`${API_URL}/api/email-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Clinic-Id': clinicId,
          'X-User-Id': userId,
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar configuración');
      }

      return data;
    } catch (error: any) {
      console.error('Error al guardar configuración de email:', error);
      throw new Error(error.message || 'Error al guardar configuración de email');
    }
  }

  /**
   * Probar configuración de email enviando un email de prueba
   */
  async testConfig(
    clinicId: string,
    testEmail: string
  ): Promise<TestEmailResponse> {
    try {
      const response = await fetch(`${API_URL}/api/email-config/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Clinic-Id': clinicId,
        },
        body: JSON.stringify({ testEmail }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al probar configuración');
      }

      return data;
    } catch (error: any) {
      console.error('Error al probar configuración de email:', error);
      throw new Error(error.message || 'Error al probar configuración de email');
    }
  }
}

export const emailConfigService = new EmailConfigService();
