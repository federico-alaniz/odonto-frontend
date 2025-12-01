'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DoctorPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al dashboard de doctor
    router.push('/doctor/dashboard');
  }, [router]);

  return null;
}
