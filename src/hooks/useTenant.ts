'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

/**
 * Hook para obtener el tenantId de la sesión del usuario
 * El tenant ya no se expone en la URL, se maneja internamente por sesión
 */
export function useTenant() {
  const { data: session } = useSession();

  const tenantId = useMemo(() => {
    return (session as any)?.tenantId || null;
  }, [session]);

  /**
   * Construye una ruta (sin tenant en el path)
   * @param path - Ruta (ej: '/admin/dashboard')
   * @returns La misma ruta (ej: '/admin/dashboard')
   */
  const buildPath = (path: string): string => {
    // Ya no agregamos tenant al path, solo retornamos el path tal cual
    return path.startsWith('/') ? path : `/${path}`;
  };

  return {
    tenantId,
    buildPath,
  };
}
