import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/layout/page-header'
import { TripForm } from '@/components/trip/trip-form'
import { tripFromFormValues, type TripFormValues } from '@/components/trip/trip-form-schema'
import { TZ } from '@/lib/datetime'
import { routes } from '@/lib/routes'
import { useCreateTrip } from '@/store'

const emptyTrip: TripFormValues = { name: '', description: '', startDate: '', endDate: '' }

export function TripCreatePage() {
  const navigate = useNavigate()
  const createTrip = useCreateTrip()

  const handleSave = (values: TripFormValues) => {
    const id = createTrip(tripFromFormValues(values, TZ.local()))
    navigate(routes.trips.trip(id), { replace: true })
  }

  return (
    <>
      <PageHeader title='New trip' backTo={routes.trips.list()} />
      <TripForm defaultValues={emptyTrip} onSubmit={handleSave} onCancel={() => navigate(-1)} />
    </>
  )
}
