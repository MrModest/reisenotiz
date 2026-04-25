import { Accommodation, Flight, Trip, TripItem } from '@/types'
import { useHeaderTitle } from '@/hooks/use-header-title'
import { FlightItemForm } from './flight/item-form'
import { AccommodationItemForm } from './accommodation/item-form'

interface TripItemEditProps {
  trip: Trip
  tripItem: TripItem
  onSave: (item: TripItem) => void
  onCancel: () => void
  isCreate?: boolean
  className?: string
}

export function TripItemForm({ trip, tripItem, onSave, onCancel, isCreate = false, className }: TripItemEditProps) {
  const result = getEdit({ tripItem, onSave, onCancel, isCreate, className })

  useHeaderTitle(trip.name, 'trip')

  return result
}

function getEdit({
  tripItem,
  onSave,
  onCancel,
  isCreate,
  className,
}: {
  tripItem: TripItem
  onSave: (item: TripItem) => void
  onCancel: () => void
  isCreate: boolean
  className?: string
}) {
  switch (tripItem.type) {
    case 'Flight':
      return (
        <FlightItemForm
          flight={tripItem as Flight}
          onSubmit={onSave}
          onCancel={onCancel}
          isCreate={isCreate}
          className={className}
        />
      )
    case 'Accommodation':
      return (
        <AccommodationItemForm
          accommodation={tripItem as Accommodation}
          onSubmit={onSave}
          onCancel={onCancel}
          isCreate={isCreate}
          className={className}
        />
      )
    default:
      return (
        <div className={className}>
          <p className='text-muted-foreground'>Unsupported item type: {tripItem.type}</p>
        </div>
      )
  }
}
