import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/Spinner';
import NewConsultationForm from './NewConsultationForm';

export default function NewConsultationPage() {
  return (
    <Suspense fallback={
      <div className="flex-1">
        <LoadingSpinner size="xl" />
      </div>
    }>
      <NewConsultationForm />
    </Suspense>
  );
}
