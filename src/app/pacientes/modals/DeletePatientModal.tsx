'use client';

import { useState } from 'react';
import MedicalModal from '@/components/ui/MedicalModal';

interface Patient {
  id: string;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  ultimaConsulta: string;
}

interface DeletePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onConfirm: (patientId: string) => void;
}

export default function DeletePatientModal({ 
  isOpen, 
  onClose, 
  patient, 
  onConfirm 
}: DeletePatientModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (!patient) return;
    
    if (confirmText.toLowerCase() !== 'eliminar') {
      alert('Por favor escriba "eliminar" para confirmar');
      return;
    }

    setIsDeleting(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onConfirm(patient.id);
      alert('✅ Paciente eliminado exitosamente');
      onClose();
      setConfirmText('');
      
    } catch {
      alert('❌ Error al eliminar el paciente. Intente nuevamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!patient) return null;

  return (
    <MedicalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Paciente"
      icon="⚠️"
      size="md"
    >
      <div className="space-y-6">
        {/* Advertencia */}
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start">
            <span className="text-red-600 mr-3 text-2xl">🚨</span>
            <div>
              <h3 className="font-semibold text-red-800 mb-2">¡Acción Irreversible!</h3>
              <p className="text-sm text-red-700">
                Esta acción eliminará permanentemente todos los datos del paciente, 
                incluyendo su historial médico, citas y documentos asociados.
              </p>
            </div>
          </div>
        </div>

        {/* Información del paciente */}
        <div className="p-4 bg-slate-50 rounded-lg border medical-border">
          <h4 className="font-semibold text-slate-800 mb-3">Paciente a Eliminar:</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-slate-600">Nombre:</span>
              <span className="text-slate-900">{patient.nombres} {patient.apellidos}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-600">Documento:</span>
              <span className="text-slate-900">{patient.numeroDocumento}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-600">Última Consulta:</span>
              <span className="text-slate-900">{formatDate(patient.ultimaConsulta)}</span>
            </div>
          </div>
        </div>

        {/* Consecuencias */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800">Se eliminarán los siguientes datos:</h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              Información personal y de contacto
            </li>
            <li className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              Historial médico completo
            </li>
            <li className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              Citas médicas programadas y pasadas
            </li>
            <li className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              Documentos y archivos adjuntos
            </li>
            <li className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              Registros de facturación
            </li>
          </ul>
        </div>

        {/* Alternativas */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <span className="text-yellow-600 mr-2 text-xl">💡</span>
            <div>
              <p className="text-sm font-medium text-yellow-800">¿Consideraste estas alternativas?</p>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                <li>• Marcar el paciente como &quot;Inactivo&quot; en lugar de eliminarlo</li>
                <li>• Archivar el expediente para consulta futura</li>
                <li>• Exportar los datos antes de la eliminación</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Confirmación */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Para confirmar, escriba <strong>&quot;eliminar&quot;</strong> en el campo de abajo:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Escriba: &quot;eliminar&quot;"
            disabled={isDeleting}
            className="w-full px-4 py-3 rounded-lg border medical-border focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end border-t medical-border pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-2 border medical-border rounded-lg text-slate-700 hover:bg-slate-50 transition-colors focus-ring disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || confirmText.toLowerCase() !== 'eliminar'}
            className={`
              px-8 py-2 rounded-lg font-medium transition-all focus-ring
              ${isDeleting || confirmText.toLowerCase() !== 'eliminar'
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
              }
            `}
          >
            {isDeleting ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⏳</span>
                Eliminando...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="mr-2">🗑️</span>
                Eliminar Paciente
              </span>
            )}
          </button>
        </div>
      </div>
    </MedicalModal>
  );
}