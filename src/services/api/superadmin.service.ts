const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface SuperadminLoginResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    role: string;
    clinicId: string;
    name?: string;
  };
  error?: string;
}

export interface CreateTenantPayload {
  clinicName: string;
  subdomain?: string;
  adminEmail: string;
  secretaryEmail?: string;
  doctorEmail?: string;
}

export interface CreateTenantResponse {
  success: boolean;
  data?: {
    clinic?: {
      clinicId: string;
      name?: string;
      subdomain?: string;
      status?: string;
    };
    users?: {
      admin?: { user?: any; tempPassword?: string };
      secretary?: { user?: any; tempPassword?: string };
      doctor?: { user?: any; tempPassword?: string };
    };
  };
  error?: string;
}

export interface Tenant {
  clinicId: string;
  name: string;
  subdomain: string;
  createdAt: string;
  createdBy: string;
  adminEmail: string | null;
  userCounts: {
    admin: number;
    secretary: number;
    doctor: number;
    total: number;
  };
}

export interface ListTenantsResponse {
  success: boolean;
  data?: Tenant[];
  count?: number;
  error?: string;
}

const handleJson = async (response: Response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const base = data?.error || 'Error en la operación';
    const detailsError = data?.details?.error;
    const detailsErrors = data?.details?.errors;
    const extra =
      detailsError || (Array.isArray(detailsErrors) && detailsErrors.length ? detailsErrors.join(' | ') : '');
    throw new Error(extra ? `${base}: ${extra}` : base);
  }
  return data;
};

class SuperadminService {
  async login(email: string, password: string, platformClinicId: string = 'platform'): Promise<SuperadminLoginResponse> {
    const res = await fetch(`${API_URL}/api/superadmin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Clinic-Id': platformClinicId,
      },
      body: JSON.stringify({ email, password }),
    });

    return handleJson(res);
  }

  async listTenants(
    platformClinicId: string,
    superadminUserId: string
  ): Promise<ListTenantsResponse> {
    const res = await fetch(`${API_URL}/api/superadmin/tenants`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Clinic-Id': platformClinicId,
        'X-User-Id': superadminUserId,
      },
    });

    return handleJson(res);
  }

  async createTenant(
    payload: CreateTenantPayload,
    platformClinicId: string,
    superadminUserId: string
  ): Promise<CreateTenantResponse> {
    const res = await fetch(`${API_URL}/api/superadmin/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Clinic-Id': platformClinicId,
        'X-User-Id': superadminUserId,
      },
      body: JSON.stringify(payload),
    });

    return handleJson(res);
  }
}

export const superadminService = new SuperadminService();
