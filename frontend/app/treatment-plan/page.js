'use client';
// force this page to always be fully client-rendered
export const dynamic = 'force-dynamic';
// disable any ISR / static regeneration
export const revalidate = 0;

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TreatmentPlan from './components/TreatmentPlan';

const TreatmentPlanPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState(null);

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
      } catch (err) {
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
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading treatment plan…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-xl font-bold text-red-600">Error</h1>
        <p>{error}</p>
        <div className="space-x-2">
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Retry
          </button>
          <button
            onClick={() => router.push('/intake-form')}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            New Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4 space-x-2">
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Refresh
          </button>
          <button
            onClick={() => router.push('/intake-form')}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            New Assessment
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Treatment Plan</h1>
        <p className="mb-6 text-gray-600">
          Based on your assessment, here is your personalized treatment plan.
        </p>
        <TreatmentPlan treatmentPlan={treatmentPlan} />
      </div>
    </div>
  );
};

export default TreatmentPlanPage;
