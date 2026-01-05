'use client';

import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();
  const { buildPath } = useTenant();

  useEffect(() => {
    // Redirigir al dashboard de admin
    router.push(buildPath('/admin/dashboard'));
  }, [router, buildPath]);

  return null;
}
