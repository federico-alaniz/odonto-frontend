'use client';

import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { useEffect } from 'react';

export default function SecretaryPage() {
  const router = useRouter();
  const { buildPath } = useTenant();

  useEffect(() => {
    // Redirigir al dashboard de secretaria
    router.push(buildPath('/secretary/dashboard'));
  }, [router, buildPath]);

  return null;
}
