const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Notification {
  clinicId: string;
  userId: string;
  tipo: 'nueva_cita' | 'paciente_llego' | 'cancelacion' | 'recordatorio';
  titulo: string;
  mensaje: string;
  relacionadoId?: string;
  relacionadoTipo?: string;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  accionUrl?: string;
  leida: boolean;
  leidaEn?: string;
  createdAt: string;
  createdBy: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

// Helper function to get headers
const getHeaders = (clinicId: string, userId: string): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-Clinic-Id': clinicId,
    'X-User-Id': userId,
  };
};

export const notificationsService = {
  /**
   * Get notifications for a user
   */
  async getNotifications(
    clinicId: string,
    userId: string,
    filters?: { leida?: boolean; page?: number; limit?: number }
  ): Promise<NotificationsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.leida !== undefined) params.append('leida', String(filters.leida));
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const url = `${API_BASE_URL}/api/notifications?${params.toString()}`;
      const headers = getHeaders(clinicId, userId);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al obtener notificaciones');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(clinicId: string, userId: string): Promise<UnreadCountResponse> {
    try {
      const url = `${API_BASE_URL}/api/notifications/unread-count`;
      const headers = getHeaders(clinicId, userId);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al obtener contador');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error fetching unread count:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(
    clinicId: string,
    userId: string,
    notificationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const url = `${API_BASE_URL}/api/notifications/${notificationId}/read`;
      const headers = getHeaders(clinicId, userId);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al marcar como leída');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error marking as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(
    clinicId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const url = `${API_BASE_URL}/api/notifications/mark-all-read`;
      const headers = getHeaders(clinicId, userId);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al marcar todas como leídas');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error marking all as read:', error);
      throw error;
    }
  },

  /**
   * Delete notification
   */
  async deleteNotification(
    clinicId: string,
    userId: string,
    notificationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const url = `${API_BASE_URL}/api/notifications/${notificationId}`;
      const headers = getHeaders(clinicId, userId);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al eliminar notificación');
      }

      return responseData;
    } catch (error: any) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  },
};
