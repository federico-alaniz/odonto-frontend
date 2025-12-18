import { Suspense } from 'react';
import NewConsultationForm from './NewConsultationForm';

export default function NewConsultationPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del paciente...</p>
        </div>
      </div>
    }>
      <NewConsultationForm />
    </Suspense>
  );
}
