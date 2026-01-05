'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Camera,
  Save,
  ArrowLeft,
  Loader2,
  Shield,
  Briefcase,
  FileText,
  Clock,
  Building2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usersService } from '@/services/api/users.service';
import { useToast } from '@/components/ui/ToastProvider';
import { UserFormData } from '@/types/roles';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<UserFormData>>({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    genero: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
  });

  const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;

  useEffect(() => {
    if (currentUser) {
      setFormData({
        nombres: currentUser.nombres || '',
        apellidos: currentUser.apellidos || '',
        email: currentUser.email || '',
        telefono: currentUser.telefono || '',
        fechaNacimiento: currentUser.fechaNacimiento || '',
        genero: currentUser.genero || '',
        direccion: currentUser.direccion || '',
        ciudad: currentUser.ciudad || '',
        provincia: currentUser.provincia || '',
        codigoPostal: currentUser.codigoPostal || '',
      });
      setAvatarPreview(currentUser.avatar || null);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.id) return;

    void (async () => {
      setIsLoading(true);
      try {
        const response = await usersService.getProfile(currentUser.id, clinicId);
        if (!response.success || !response.data) return;

        const user = response.data as any;
        setFormData({
          nombres: user.nombres || '',
          apellidos: user.apellidos || '',
          email: user.email || '',
          telefono: user.telefono || '',
          fechaNacimiento: user.fechaNacimiento || '',
          genero: user.genero || '',
          direccion: user.direccion || '',
          ciudad: user.ciudad || '',
          provincia: user.provincia || '',
          codigoPostal: user.codigoPostal || '',
        });
        setAvatarPreview(user.avatar || null);
      } catch (_error) {
        showError('Error al cargar perfil', 'No se pudo obtener tu información. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clinicId, currentUser?.id, showError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showError('Archivo inválido', 'Por favor selecciona una imagen');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Archivo muy grande', 'El tamaño máximo es 5MB');
      return;
    }

    // Preview local y guardar en formData
    const reader = new FileReader();
    reader.onloadend = () => {
      const localUrl = reader.result as string;
      setAvatarPreview(localUrl);
      // Agregar el avatar al formData para enviarlo al backend
      setFormData(prev => ({ ...prev, avatar: localUrl }));
    };
    reader.readAsDataURL(file);

    showSuccess('Avatar cargado', 'Guarda los cambios para actualizar tu foto de perfil');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;

    setIsSaving(true);
    try {
      const response = await usersService.updateProfile(formData, clinicId, currentUser.id);
      
      if (response.success && response.data) {
        showSuccess('Perfil actualizado', 'Tus datos han sido guardados correctamente');

        const user = response.data as any;
        setFormData({
          nombres: user.nombres || '',
          apellidos: user.apellidos || '',
          email: user.email || '',
          telefono: user.telefono || '',
          fechaNacimiento: user.fechaNacimiento || '',
          genero: user.genero || '',
          direccion: user.direccion || '',
          ciudad: user.ciudad || '',
          provincia: user.provincia || '',
          codigoPostal: user.codigoPostal || '',
        });
        setAvatarPreview(user.avatar || null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Error al actualizar', 'No se pudo guardar tu perfil. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-800', icon: Shield },
      doctor: { label: 'Doctor', color: 'bg-green-100 text-green-800', icon: Briefcase },
      secretary: { label: 'Secretaria', color: 'bg-blue-100 text-blue-800', icon: FileText }
    };
    return badges[role as keyof typeof badges] || badges.doctor;
  };

  const roleBadge = getRoleBadge(currentUser.role);
  const RoleIcon = roleBadge.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/${currentUser.role}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información personal y configuración</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Avatar y Info Básica */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{currentUser.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <button
                    onClick={handleAvatarClick}
                    type="button"
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {currentUser.name}
                </h2>
                <p className="text-sm text-gray-600">{currentUser.email}</p>
                
                <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${roleBadge.color}`}>
                  <RoleIcon className="w-4 h-4" />
                  {roleBadge.label}
                </div>
              </div>

              {/* Info Adicional */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                {currentUser.department && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{currentUser.department}</span>
                  </div>
                )}
                {currentUser.specialization && (
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{currentUser.specialization}</span>
                  </div>
                )}
                {currentUser.createdAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Miembro desde {new Date(currentUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formulario Principal */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombres *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Apellidos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellidos *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">El email no puede ser modificado</p>
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={formData.fechaNacimiento}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Género */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {/* Dirección */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Provincia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provincia
                  </label>
                  <input
                    type="text"
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Código Postal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    name="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="mt-8 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
