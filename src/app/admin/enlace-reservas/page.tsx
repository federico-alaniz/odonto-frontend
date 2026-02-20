'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Share2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export default function EnlaceReservasPage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const [clinicId, setClinicId] = useState<string>('');
  const [bookingUrl, setBookingUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isAuthLoading || !currentUser?.clinicId) {
      return;
    }

    const currentClinicId = currentUser.clinicId;
    setClinicId(currentClinicId);
    
    // Generar URL de reserva
    const frontendUrl = window.location.origin;
    const url = `${frontendUrl}/reservar-turno?clinicId=${currentClinicId}`;
    setBookingUrl(url);
  }, [currentUser?.clinicId, isAuthLoading]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      toast.success('¡Enlace copiado al portapapeles!');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error('Error al copiar el enlace');
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Reservar Turno',
          text: 'Reserva tu turno online',
          url: bookingUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };

  const handleOpenPreview = () => {
    window.open(bookingUrl, '_blank');
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!currentUser?.clinicId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: No se encontró la clínica del usuario</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Enlace de Reserva de Turnos</h1>
        <p className="text-gray-600">
          Comparte este enlace con tus pacientes para que puedan reservar turnos online
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Share2 className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Tu Enlace Único</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* URL Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enlace de Reserva
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={bookingUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-mono text-sm"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Clinic ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID de Clínica
            </label>
            <input
              type="text"
              value={clinicId}
              readOnly
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-mono text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenPreview}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Vista Previa</span>
            </button>
            
            {typeof window !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Compartir</span>
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">¿Cómo usar este enlace?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Comparte este enlace con tus pacientes por WhatsApp, email o redes sociales</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Los pacientes podrán ver tus horarios disponibles y reservar turnos directamente</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Si el paciente ya existe en tu base de datos, sus datos se pre-cargarán automáticamente</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Los nuevos pacientes se crearán automáticamente al confirmar el turno</span>
              </li>
            </ul>
          </div>

          {/* QR Code Section (Optional - for future implementation) */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-800 mb-2">Próximamente</h3>
            <p className="text-sm text-gray-600">
              Podrás generar un código QR para compartir en tu consultorio y facilitar la reserva de turnos.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Tips */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">💡 Consejos</h3>
        <ul className="space-y-1 text-sm text-yellow-800">
          <li>• Agrega este enlace a tu sitio web o redes sociales</li>
          <li>• Inclúyelo en tu firma de email</li>
          <li>• Compártelo en grupos de WhatsApp de pacientes</li>
          <li>• Publícalo en tu perfil de Google My Business</li>
        </ul>
      </div>
    </div>
  );
}
