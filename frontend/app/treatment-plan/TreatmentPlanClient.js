//This is for (Client. Dynamic)

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import TreatmentPlan from './components/TreatmentPlan'

export default function TreatmentPlanClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading]       = useState(true)
  const [error, setError]               = useState(null)
  const [treatmentPlan, setTreatmentPlan] = useState(null)

  useEffect(() => {
    const generateTreatmentPlan = async () => {
      try {
        const sessionId = searchParams.get('session_id')
        if (!sessionId) throw new Error('No session ID found')

        const res = await fetch('/api/treatment_plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        })
        if (!res.ok) throw new Error('Failed to generate treatment plan')
        setTreatmentPlan(await res.json())
      } catch (err) {
        console.error('Error generating treatment plan:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    generateTreatmentPlan()
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen …">
        <p>Loading treatment plan...</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen …">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => router.push('/intake-form')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return to Intake Form
        </button>
      </div>
    )
  }
  return (
    <div className="min-h-screen …">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Treatment Plan</h1>
      {treatmentPlan && <TreatmentPlan treatmentPlan={treatmentPlan} />}
    </div>
  )
}
