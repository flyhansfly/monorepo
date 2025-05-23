// This is for (Server. Static)

// disable any ISR / static prerender for this route
export const dynamic    = 'force-dynamic'
export const revalidate = 0

import TreatmentPlanClient from './TreatmentPlanClient'

export default function TreatmentPlanPage() {
  return <TreatmentPlanClient />
}
