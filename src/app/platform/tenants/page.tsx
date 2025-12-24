'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, ClipboardCopy, Download, KeyRound, LogOut, Plus, Shield, User, Users, Calendar, ExternalLink } from 'lucide-react';
import { superadminService, Tenant } from '@/services/api/superadmin.service';

type SuperadminSession = {
  id: string;
  email: string;
  role: string;
  clinicId: string;
  name?: string;
};

export default function PlatformTenantsPage() {
  const router = useRouter();

  const [session, setSession] = useState<SuperadminSession | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    clinicName: '',
    subdomain: '',
    adminEmail: '',
    secretaryEmail: '',
    doctorEmail: '',
  });

  const [created, setCreated] = useState<any>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem('superadminSession');
    if (!raw) {
      router.push('/platform/login');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as SuperadminSession;
      if (!parsed?.id) {
        router.push('/platform/login');
        return;
      }
      setSession(parsed);
    } catch {
      router.push('/platform/login');
    }
  }, [router]);

  useEffect(() => {
    if (session?.id) {
      loadTenants();
    }
  }, [session]);

  const loadTenants = async () => {
    if (!session?.id) return;
    
    setLoadingTenants(true);
    try {
      const res = await superadminService.listTenants(platformClinicId, session.id);
      if (res.success && res.data) {
        setTenants(res.data);
      }
    } catch (err) {
      // Silently fail
    } finally {
      setLoadingTenants(false);
    }
  };

  const platformClinicId = useMemo(() => session?.clinicId || 'platform', [session?.clinicId]);

  const suggestedSubdomain = useMemo(() => {
    const value = (form.clinicName || '').trim().toLowerCase();
    const cleaned = value
      .replace(/[^a-z0-9\s._-]/g, '')
      .replace(/[\s._]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
    return cleaned;
  }, [form.clinicName]);

  const tenantUrl = useMemo(() => {
    const sd = (created?.clinic?.subdomain || '').trim();
    if (!sd) return '';
    return `http://${sd}.localtest.me:3000`;
  }, [created]);

  const logout = () => {
    window.localStorage.removeItem('superadminSession');
    router.push('/platform/login');
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const buildTenantTxt = () => {
    if (!created?.clinic?.clinicId) return '';

    const clinicId = created.clinic.clinicId;
    const clinicName = created.clinic.name || '';
    const subdomain = created.clinic.subdomain || '';
    const url = subdomain ? `http://${subdomain}.localtest.me:3000` : '';
    const now = new Date().toISOString();

    const lines: string[] = [];
    lines.push(`Tenant provisioning`);
    lines.push(`Generated at: ${now}`);
    lines.push('');
    lines.push(`Clinic name: ${clinicName}`);
    lines.push(`ClinicId: ${clinicId}`);
    if (subdomain) lines.push(`Subdomain: ${subdomain}`);
    if (url) lines.push(`URL: ${url}`);
    lines.push('');
    lines.push('Temporary credentials:');

    (['admin', 'secretary', 'doctor'] as const).forEach((role) => {
      const u = created?.users?.[role]?.user;
      const p = created?.users?.[role]?.tempPassword;
      lines.push('');
      lines.push(`${role.toUpperCase()}`);
      lines.push(`Email: ${u?.email || '-'}`);
      lines.push(`Password: ${p || '-'}`);
    });

    lines.push('');
    return lines.join('\n');
  };

  const downloadTenantTxt = () => {
    const content = buildTenantTxt();
    if (!content) return;

    const subdomain = (created?.clinic?.subdomain || '').trim();
    const clinicId = (created?.clinic?.clinicId || '').trim();
    const safe = (subdomain || clinicId || 'tenant')
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `tenant-${safe || 'info'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreated(null);

    if (!session?.id) {
      setError('Sesión inválida. Vuelve a iniciar sesión.');
      return;
    }
    if (!form.clinicName.trim()) {
      setError('Clinic name es requerido');
      return;
    }
    if (!form.adminEmail.trim()) {
      setError('Admin email es requerido');
      return;
    }

    setIsLoading(true);
    try {
      const res = await superadminService.createTenant(
        {
          clinicName: form.clinicName.trim(),
          subdomain: (form.subdomain || suggestedSubdomain || '').trim() || undefined,
          adminEmail: form.adminEmail.trim(),
          secretaryEmail: form.secretaryEmail.trim() || undefined,
          doctorEmail: form.doctorEmail.trim() || undefined,
        },
        platformClinicId,
        session.id
      );

      if (!res?.success) {
        setError(res?.error || 'Error al crear tenant');
        return;
      }

      setCreated(res.data);
      setForm({ clinicName: '', subdomain: '', adminEmail: '', secretaryEmail: '', doctorEmail: '' });
      setShowCreateModal(false);
      
      // Recargar lista de tenants
      await loadTenants();
    } catch (err: any) {
      setError(err?.message || 'Error al crear tenant');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Plataforma</h1>
                <p className="text-gray-600 mt-1">Provisioning de tenants</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {session && (
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{session.email}</span>
                </div>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Tabla de Tenants Existentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Tenants Creados</h2>
                <p className="text-sm text-gray-600">
                  {loadingTenants ? 'Cargando...' : `${tenants.length} tenant${tenants.length !== 1 ? 's' : ''} en total`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear Tenant
            </button>
          </div>

          {loadingTenants ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No hay tenants creados aún</p>
              <p className="text-sm text-gray-500 mt-1">Crea tu primer tenant usando el formulario abajo</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Clínica</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Subdomain</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Admin Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Usuarios</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Creado</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.clinicId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{tenant.name || 'Sin nombre'}</p>
                          <p className="text-xs text-gray-500 font-mono">{tenant.clinicId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                            {tenant.subdomain}
                          </code>
                          <button
                            onClick={() => copy(`http://${tenant.subdomain}.localtest.me:3000`)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            title="Copiar URL"
                          >
                            <ClipboardCopy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-700">{tenant.adminEmail || 'N/A'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1 text-gray-600">
                            <User className="w-3.5 h-3.5" />
                            <span>{tenant.userCounts.admin}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users className="w-3.5 h-3.5" />
                            <span>{tenant.userCounts.secretary}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Shield className="w-3.5 h-3.5" />
                            <span>{tenant.userCounts.doctor}</span>
                          </div>
                          <span className="text-gray-400">|</span>
                          <span className="font-medium text-gray-700">{tenant.userCounts.total} total</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(tenant.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <a
                          href={`http://${tenant.subdomain}.localtest.me:3000/login`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Abrir
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Creación de Tenant */}
        {showCreateModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Crear tenant</h2>
                    <p className="text-sm text-gray-600">Genera clinicId + settings + usuarios base</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la clínica</label>
                    <input
                      value={form.clinicName}
                      onChange={(e) => setForm((p) => ({ ...p, clinicName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Clínica Central"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subdominio (slug)</label>
                    <input
                      value={form.subdomain}
                      onChange={(e) => setForm((p) => ({ ...p, subdomain: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={suggestedSubdomain || 'odonto-salud'}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Sugerido: <span className="font-mono">{suggestedSubdomain || '-'}</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admin email</label>
                      <input
                        value={form.adminEmail}
                        onChange={(e) => setForm((p) => ({ ...p, adminEmail: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="admin@clinica.com"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secretary email (opcional)</label>
                      <input
                        value={form.secretaryEmail}
                        onChange={(e) => setForm((p) => ({ ...p, secretaryEmail: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="secretary@clinica.com"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Doctor email (opcional)</label>
                      <input
                        value={form.doctorEmail}
                        onChange={(e) => setForm((p) => ({ ...p, doctorEmail: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="doctor@clinica.com"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setError('');
                      }}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Building2 className="w-5 h-5" />
                      {isLoading ? 'Creando...' : 'Crear tenant'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {created?.clinic?.clinicId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Tenant creado</h2>
                <p className="text-sm text-gray-600">Guarda estas credenciales temporales</p>
              </div>
              <div className="flex-1" />
              <button
                type="button"
                onClick={downloadTenantTxt}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar .txt
              </button>
            </div>

            <div className="space-y-4">
              {created?.clinic?.subdomain && (
                <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-500">subdomain</p>
                    <p className="font-mono text-sm text-gray-900">{created.clinic.subdomain}</p>
                    {tenantUrl && <p className="text-xs text-gray-500 mt-1">{tenantUrl}</p>}
                  </div>
                  <button
                    onClick={() => copy(tenantUrl || created.clinic.subdomain)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    title="Copiar"
                  >
                    <ClipboardCopy className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                <div>
                  <p className="text-xs text-gray-500">clinicId</p>
                  <p className="font-mono text-sm text-gray-900">{created.clinic.clinicId}</p>
                </div>
                <button
                  onClick={() => copy(created.clinic.clinicId)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  title="Copiar"
                >
                  <ClipboardCopy className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['admin', 'secretary', 'doctor'].map((role) => (
                  <div key={role} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <KeyRound className="w-4 h-4 text-blue-700" />
                      <p className="font-medium text-gray-900">{role}</p>
                    </div>
                    <p className="text-xs text-gray-500">email</p>
                    <p className="text-sm text-gray-900 break-all">{created.users?.[role]?.user?.email || '-'}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">tempPassword</p>
                        <p className="font-mono text-sm text-gray-900">{created.users?.[role]?.tempPassword || '-'}</p>
                      </div>
                      {created.users?.[role]?.tempPassword && (
                        <button
                          onClick={() => copy(created.users?.[role]?.tempPassword)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                          title="Copiar"
                        >
                          <ClipboardCopy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  Para usar la app como tenant, levantá el frontend con subdominio y configurá el cookie tenantId.
                </p>
                <p className="mt-2">
                  Volver al login normal:
                  <Link href="/login" className="ml-2 text-blue-600 hover:text-blue-700">
                    /login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
