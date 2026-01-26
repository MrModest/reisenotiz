import { Flight, Trip, TripItem } from '@/types'
import { useHeaderTitle } from '@/hooks/use-header-title'
import { FlightItemForm } from './flight/item-form'

interface TripItemEditProps {
  trip: Trip
  tripItem: TripItem
  onSave: (item: TripItem) => void
  onCancel: () => void
  isCreate?: boolean
  className?: string
}

export function TripItemForm({ trip, tripItem, onSave, onCancel, isCreate, className }: TripItemEditProps) {
  const result = getEdit({ tripItem, onSave, onCancel, isCreate, className })

  useHeaderTitle(trip.name, 'trip')

  return result.view
}

function getEdit({ tripItem, onSave, onCancel, isCreate, className }: {
  tripItem: TripItem
  onSave: (item: TripItem) => void
  onCancel: () => void
  isCreate?: boolean
  className?: string
}) {
  switch (tripItem.type) {
    case 'Flight':
      return {
        view: (
          <FlightItemForm
            flight={tripItem as Flight}
            onSubmit={onSave}
            onCancel={onCancel}
            title={isCreate ? 'New Flight' : 'Edit Flight'}
            className={className}
          />
        ),
        title: isCreate ? 'New Flight' : 'Edit Flight',
        icon: 'flight'
      }
    case 'Accommodation':
      return {
        view: (
          <div className={className}>
            <p className="text-muted-foreground">Hotel edit form (not implemented yet)</p>
          </div>
        ),
        title: isCreate ? 'New Accommodation' : 'Edit Accommodation',
        icon: 'hotel-checkIn'
      }
    default:
      return {
        view: (
          <div className={className}>
            <p className="text-muted-foreground">Unsupported item type: {tripItem.type}</p>
          </div>
        ),
        title: 'Unsupported Type'
      }
  }
}
