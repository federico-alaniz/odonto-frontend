'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al dashboard de admin
    router.push('/admin/dashboard');
  }, [router]);

  return null;
}
