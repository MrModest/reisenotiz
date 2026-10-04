import { Suspense } from 'react'
import { useParams } from 'react-router'
import { PageHeader } from '@/components/layout/page-header'
import { TripForm } from '@/components/trip/trip-form'
import { tripFormValues, tripFromFormValues, type TripFormValues } from '@/components/trip/trip-form-schema'
import { routes } from '@/lib/routes'
import { useGoBack } from '@/hooks/use-go-back'
import { useTrip, useTripExists, useUpdateTrip } from '@/store'

export function TripEditPage() {
  const { tripId } = useParams<{ tripId: string }>()
  if (!tripId) return <NotFound />
  return <TripEditGate tripId={tripId} />
}

function TripEditGate({ tripId }: { tripId: string }) {
  if (!useTripExists(tripId)) return <NotFound />
  return (
    <Suspense fallback={<PageHeader title='' backTo={routes.trips.list()} />}>
      <TripEditContent tripId={tripId} />
    </Suspense>
  )
}

function TripEditContent({ tripId }: { tripId: string }) {
  const goBack = useGoBack(routes.trips.list())
  const trip = useTrip(tripId)
  const updateTrip = useUpdateTrip(tripId)

  // The dates stay in the zone the trip was created in
  const handleSave = (values: TripFormValues) => {
    updateTrip(tripFromFormValues(values, trip.startDate.zone))
    goBack()
  }

  return (
    <>
      <PageHeader title='Edit trip' backTo={routes.trips.list()} />
      <TripForm defaultValues={tripFormValues(trip)} onSubmit={handleSave} onCancel={goBack} />
    </>
  )
}

function NotFound() {
  return <PageHeader title='Not found' backTo={routes.trips.list()} />
}
