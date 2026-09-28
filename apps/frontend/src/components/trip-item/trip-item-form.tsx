import { Accommodation, Flight, TripItem } from '@/types'
import { FlightItemForm } from './flight/item-form'
import { AccommodationItemForm } from './accommodation/item-form'

interface TripItemEditProps {
  tripItem: TripItem
  onSave: (item: TripItem) => void
  onCancel: () => void
  isCreate?: boolean
  className?: string
}

export function TripItemForm({ tripItem, onSave, onCancel, isCreate = false, className }: TripItemEditProps) {
  return getEdit({ tripItem, onSave, onCancel, isCreate, className })
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
