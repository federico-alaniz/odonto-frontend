import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/Spinner';
import NewAppointmentFlow from './NewAppointmentFlow';

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="flex-1">
        <LoadingSpinner size="xl" />
      </div>
    }>
      <NewAppointmentFlow />
    </Suspense>
  );
}
