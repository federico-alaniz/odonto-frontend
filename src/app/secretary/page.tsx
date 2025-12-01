'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SecretaryPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al dashboard de secretaria
    router.push('/secretary/dashboard');
  }, [router]);

  return null;
}
