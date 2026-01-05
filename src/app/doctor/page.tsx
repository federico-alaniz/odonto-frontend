'use client';

import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { useEffect } from 'react';

export default function DoctorPage() {
  const router = useRouter();
  const { buildPath } = useTenant();

  useEffect(() => {
    // Redirigir al dashboard de doctor
    router.push(buildPath('/doctor/dashboard'));
  }, [router, buildPath]);

  return null;
}
