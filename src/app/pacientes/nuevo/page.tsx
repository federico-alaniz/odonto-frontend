'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { UserPlus, Info, ArrowLeft } from 'lucide-react';
import NewPatientForm from "./NewPatientForm";
import { Suspense } from 'react';

export default function NewPatientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPatientContent />
    </Suspense>
  );
}

function NewPatientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { buildPath } = useTenant();

  const handleBack = () => {
    // Check if coming from appointments
    const from = searchParams.get('from');
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    
    if (from === 'appointments' && doctorId && date && time) {
      // Go back to the appointment booking page with the same parameters
      router.push(buildPath(`/secretary/appointments?doctorId=${doctorId}&date=${date}&time=${time}`));
    } else {
      // Default behavior: go back to patients list
      router.push(buildPath('/secretary/patients'));
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Paciente</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Complete la información para registrar un nuevo paciente en el sistema
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb visual */}
        <div className="px-6 pb-4">
          <div className="flex items-center text-sm text-gray-700 space-x-2">
            <span>Gestión</span>
            <span>•</span>
            <button 
              onClick={handleBack}
              className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors"
            >
              {searchParams.get('from') === 'appointments' ? 'Reserva de Turnos' : 'Pacientes'}
            </button>
            <span>•</span>
            <span className="text-green-600 font-medium">Registro Nuevo</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <NewPatientForm />
      </div>
    </div>
  );
}