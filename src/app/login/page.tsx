'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Building2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { UserRole } from '@/types/roles';

const AUTH_DEBUG = process.env.NEXT_PUBLIC_AUTH_DEBUG === '1';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const readCookie = (name: string) => {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
};

/**
 * Extrae el tenant_id del path de la URL
 * Formato esperado: /login?tenant=[tenant_id] o directamente de la URL
 */
const getTenantFromUrl = (): string => {
  if (typeof window === 'undefined') return 'clinic_001';
  
  // Intentar obtener de query params
  const params = new URLSearchParams(window.location.search);
  const tenantParam = params.get('tenant');
  if (tenantParam) return tenantParam;
  
  // Intentar obtener de cookie
  const cookieTenant = readCookie('tenantId');
  if (cookieTenant) return cookieTenant;
  
  return 'clinic_001';
};

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [clinicName, setClinicName] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') return;
    const role = (session as any)?.user?.role as UserRole | undefined;
    const tenantId = (session as any)?.user?.tenantId;
    if (!role || !tenantId) return;
    const redirectPath = getRoleRedirectPath(role, tenantId);
    console.log('🔐 [LOGIN] Redirecting to:', redirectPath);
    router.push(redirectPath);
  }, [session, status, router]);

  useEffect(() => {
    const loadClinicName = async () => {
      try {
        const tenantId = getTenantFromUrl();
        
        if (!tenantId || tenantId === 'clinic_001') {
          setClinicName('MediCore');
          return;
        }

        const clinicMetaStorageKey = `${tenantId}_clinic_meta`;
        const raw = window.localStorage.getItem(clinicMetaStorageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          const name = parsed?.clinicName;
          if (name) {
            setClinicName(name);
            return;
          }
        }

        setClinicName('MediCore');
      } catch {
        setClinicName('MediCore');
      }
    };

    loadClinicName();
  }, []);

  // Función para obtener la ruta según el rol con tenant
  const getRoleRedirectPath = (role: UserRole, tenantId: string): string => {
    const roleRoutes: Record<UserRole, string> = {
      admin: `/${tenantId}/admin/dashboard`,
      doctor: `/${tenantId}/doctor/dashboard`,
      secretary: `/${tenantId}/secretary/dashboard`
    };
    return roleRoutes[role] || `/${tenantId}/admin/dashboard`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validaciones básicas
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);

    try {
      // No especificar callbackUrl con tenant, dejar que el backend determine el tenant
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales inválidas');
        setIsLoading(false);
        return;
      }

      // Session will update and useEffect above will redirect using tenant from backend
      setIsLoading(false);
      
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error al iniciar sesión. Intenta nuevamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header con Logo */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{clinicName || 'MediCore'}</h1>
            <p className="text-blue-100 text-sm">Sistema de Gestión Médica</p>
          </div>

          {/* Formulario */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
              <p className="text-gray-600 text-sm">Ingresa tus credenciales para acceder</p>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-400"
                    placeholder="tu@email.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-400"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Recordarme y Olvidé mi contraseña */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Recordarme
                  </label>
                </div>
                <Link
                  href="/recuperar-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/terminos" className="text-blue-600 hover:text-blue-700 underline">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacidad" className="text-blue-600 hover:text-blue-700 underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
