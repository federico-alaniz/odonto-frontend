const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Permission {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  export?: boolean;
}

export interface RolePermissions {
  patients: Permission;
  appointments: Permission;
  medicalRecords: Permission;
  billing: Permission;
  users: Permission;
  settings: Permission;
  reports: Permission;
}

export interface RoleConfig {
  clinicId: string;
  role: string;
  displayName: string;
  description: string;
  permissions: RolePermissions;
  isSystem: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CreateRoleData {
  role: string;
  displayName: string;
  description?: string;
  permissions: RolePermissions;
}

export interface UpdatePermissionsData {
  permissions: RolePermissions;
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
    throw new Error(data.error || data.message || 'Error en la petición');
  }

  return data;
};

class RolePermissionsService {
  async getAllRoles(clinicId: string, userId: string): Promise<RoleConfig[]> {
    const response = await fetch(`${API_URL}/api/role-permissions`, {
      method: 'GET',
      headers: getHeaders(clinicId, userId),
    });
    
    const data = await handleResponse(response);
    return data.data || [];
  }

  async getRolePermissions(role: string, clinicId: string, userId: string): Promise<RoleConfig> {
    const response = await fetch(`${API_URL}/api/role-permissions/${role}`, {
      method: 'GET',
      headers: getHeaders(clinicId, userId),
    });
    
    const data = await handleResponse(response);
    return data.data;
  }

  async updateRolePermissions(role: string, permissions: UpdatePermissionsData, clinicId: string, userId: string): Promise<RoleConfig> {
    const response = await fetch(`${API_URL}/api/role-permissions/${role}`, {
      method: 'PUT',
      headers: getHeaders(clinicId, userId),
      body: JSON.stringify(permissions),
    });
    
    const data = await handleResponse(response);
    return data.data;
  }

  async createCustomRole(roleData: CreateRoleData, clinicId: string, userId: string): Promise<RoleConfig> {
    const response = await fetch(`${API_URL}/api/role-permissions`, {
      method: 'POST',
      headers: getHeaders(clinicId, userId),
      body: JSON.stringify(roleData),
    });
    
    const data = await handleResponse(response);
    return data.data;
  }

  async deleteCustomRole(role: string, clinicId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/role-permissions/${role}`, {
      method: 'DELETE',
      headers: getHeaders(clinicId, userId),
    });
    
    await handleResponse(response);
  }

  async initializeDefaultRoles(clinicId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/role-permissions/initialize`, {
      method: 'POST',
      headers: getHeaders(clinicId, userId),
    });
    
    await handleResponse(response);
  }
}

export const rolePermissionsService = new RolePermissionsService();
