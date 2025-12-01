// src/services/api/users.service.ts
import { User, UserFormData } from '@/types/roles';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Headers comunes para todas las peticiones
const getHeaders = (clinicId?: string, userId?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // TODO: Obtener estos valores del contexto de autenticación
  if (clinicId) headers['X-Clinic-Id'] = clinicId;
  if (userId) headers['X-User-Id'] = userId;
  
  return headers;
};

// Helper para manejar respuestas y errores de forma consistente
const handleResponse = async (response: Response) => {
  // Intentar parsear la respuesta
  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
  }

  // Verificar errores de MongoDB Atlas
  if (data.code === 8000 || (data.errmsg && data.errmsg.includes('authentication failed'))) {
    throw new Error('Error de conexión con la base de datos. Contacta al administrador del sistema.');
  }
  
  // Verificar si la respuesta es exitosa
  if (!response.ok) {
    throw new Error(data.error || data.errmsg || 'Error en la operación');
  }

  return data;
};

// Helper para manejar errores de fetch
const handleFetchError = (error: any) => {
  console.error('API Error:', error);
  
  // Errores de red (backend no disponible)
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    throw new Error('No se puede conectar con el backend. Verifica que esté corriendo en http://localhost:5000');
  }
  
  // Re-lanzar el error con el mensaje ya procesado
  throw error;
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UsersQueryParams {
  role?: 'admin' | 'doctor' | 'secretary';
  estado?: 'activo' | 'inactivo' | 'suspendido';
  page?: number;
  limit?: number;
}

class UsersService {
  /**
   * Crear un nuevo usuario
   * POST /api/users
   */
  async createUser(
    userData: UserFormData,
    clinicId: string,
    userId: string
  ): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: getHeaders(clinicId, userId),
        body: JSON.stringify(userData),
      });

      return await handleResponse(response);
    } catch (error: any) {
      return handleFetchError(error);
    }
  }

  /**
   * Obtener todos los usuarios con filtros opcionales
   * GET /api/users
   */
  async getUsers(
    clinicId: string,
    params?: UsersQueryParams
  ): Promise<PaginatedResponse<User>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.role) queryParams.append('role', params.role);
      if (params?.estado) queryParams.append('estado', params.estado);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `${API_URL}/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(clinicId),
      });

      return await handleResponse(response);
    } catch (error: any) {
      return handleFetchError(error);
    }
  }

  /**
   * Obtener un usuario por ID
   * GET /api/users/:id
   */
  async getUserById(
    userId: string,
    clinicId: string
  ): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'GET',
        headers: getHeaders(clinicId),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener usuario');
      }

      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Actualizar un usuario
   * PUT /api/users/:id
   */
  async updateUser(
    userId: string,
    userData: Partial<UserFormData>,
    clinicId: string,
    currentUserId: string
  ): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: getHeaders(clinicId, currentUserId),
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar usuario');
      }

      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Eliminar un usuario (soft delete)
   * DELETE /api/users/:id
   */
  async deleteUser(
    userId: string,
    clinicId: string,
    currentUserId: string
  ): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(clinicId, currentUserId),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar usuario');
      }

      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios por rol
   * GET /api/users/by-role/:role
   */
  async getUsersByRole(
    role: 'admin' | 'doctor' | 'secretary',
    clinicId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<User>> {
    try {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page.toString());
      if (limit) queryParams.append('limit', limit.toString());

      const url = `${API_URL}/api/users/by-role/${role}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(clinicId),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener usuarios por rol');
      }

      return data;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios por estado
   * GET /api/users/by-estado/:estado
   */
  async getUsersByEstado(
    estado: 'activo' | 'inactivo' | 'suspendido',
    clinicId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<User>> {
    try {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page.toString());
      if (limit) queryParams.append('limit', limit.toString());

      const url = `${API_URL}/api/users/by-estado/${estado}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(clinicId),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener usuarios por estado');
      }

      return data;
    } catch (error) {
      console.error('Error fetching users by estado:', error);
      throw error;
    }
  }

  /**
   * Autenticar usuario por email
   * GET /api/users/by-email/:email
   */
  async authenticateByEmail(
    email: string,
    clinicId: string
  ): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_URL}/api/users/by-email/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: getHeaders(clinicId),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Usuario no encontrado');
      }

      return data;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  /**
   * Actualizar timestamp de último login
   * POST /api/users/:id/login
   */
  async updateLogin(
    userId: string,
    clinicId: string
  ): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/login`, {
        method: 'POST',
        headers: getHeaders(clinicId),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar login');
      }

      return data;
    } catch (error) {
      console.error('Error updating login:', error);
      throw error;
    }
  }

  /**
   * Obtener perfil del usuario actual
   * GET /api/users/profile
   */
  async getProfile(
    userId: string,
    clinicId: string
  ): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'GET',
        headers: getHeaders(clinicId, userId),
      });

      return await handleResponse(response);
    } catch (error) {
      return handleFetchError(error);
    }
  }

  /**
   * Actualizar perfil del usuario actual
   * PUT /api/users/profile
   */
  async updateProfile(
    profileData: Partial<UserFormData>,
    clinicId: string,
    userId: string
  ): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: getHeaders(clinicId, userId),
        body: JSON.stringify(profileData),
      });

      return await handleResponse(response);
    } catch (error: any) {
      // Si el backend no está disponible, simular éxito para desarrollo
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('Backend no disponible, simulando actualización de perfil');
        // Obtener usuario actual del localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const currentUser = JSON.parse(storedUser);
          const updatedUser = { ...currentUser, ...profileData };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          return {
            success: true,
            data: updatedUser
          };
        }
      }
      return handleFetchError(error);
    }
  }

}

// Exportar instancia única del servicio
export const usersService = new UsersService();
