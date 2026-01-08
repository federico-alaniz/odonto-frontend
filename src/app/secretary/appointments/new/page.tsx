import { Suspense } from 'react';
import NewAppointmentFlow from './NewAppointmentFlow';

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <NewAppointmentFlow />
    </Suspense>
  );
}
