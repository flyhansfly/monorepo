// disable any ISR / static prerender for this route
export const dynamic    = 'force-dynamic';
export const revalidate = 0;

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TreatmentPlan from './components/TreatmentPlan';

const TreatmentPlanPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<any>(null);

  useEffect(() => {
    const generateTreatmentPlan = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) throw new Error('No session ID found');

        const res = await fetch('/api/treatment_plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!res.ok) throw new Error('Failed to generate treatment plan');

        const data = await res.json();
        setTreatmentPlan(data);
      } catch (err: any) {
        console.error('Error generating treatment plan:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    generateTreatmentPlan();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p>Loading treatment plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/intake-form')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Intake Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Treatment Plan</h1>
          <p className="text-lg text-gray-600">
            Based on your assessment, here is your personalized treatment plan
          </p>
        </div>
        {treatmentPlan && <TreatmentPlan treatmentPlan={treatmentPlan} />}
      </div>
    </div>
  );
};

export default TreatmentPlanPage;
