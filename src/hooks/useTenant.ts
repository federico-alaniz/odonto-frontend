'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

/**
 * Hook para obtener el tenantId del path actual
 * Formato esperado: /[tenantId]/admin/... o /[tenantId]/doctor/...
 */
export function useTenant() {
  const pathname = usePathname();

  const tenantId = useMemo(() => {
    // Rutas públicas sin tenant
    if (!pathname || pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/platform') || pathname.startsWith('/api/')) {
      return null;
    }

    const segments = pathname.split('/').filter(Boolean);
    
    // Si no hay segmentos, no hay tenant
    if (segments.length === 0) {
      return null;
    }

    // El primer segmento es el tenant_id
    return segments[0];
  }, [pathname]);

  /**
   * Construye una ruta con el tenant_id incluido
   * @param path - Ruta sin tenant (ej: '/admin/dashboard')
   * @returns Ruta completa con tenant (ej: '/clinic_001/admin/dashboard')
   */
  const buildPath = (path: string): string => {
    if (!tenantId) return path;
    
    // Si el path ya incluye el tenant, devolverlo tal cual
    if (path.startsWith(`/${tenantId}/`)) return path;
    
    // Agregar el tenant al inicio del path
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${tenantId}${cleanPath}`;
  };

  return {
    tenantId,
    buildPath,
  };
}
