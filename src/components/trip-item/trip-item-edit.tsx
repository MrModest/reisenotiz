import { Flight, Trip, TripItem } from '@/types'
import { useHeaderTitle } from '@/hooks/use-header-title'
import { FlightItemEdit } from './flight/item-edit'

interface TripItemEditProps {
  trip: Trip
  tripItem: TripItem
  onSave: (item: TripItem) => void
  className?: string
}

export function TripItemEdit({ trip, tripItem, onSave, className }: TripItemEditProps) {
  const result = getEdit({ tripItem, onSave, className })

  useHeaderTitle(trip.name, 'trip')

  return result.view
}

function getEdit({ tripItem, onSave, className }: { tripItem: TripItem; onSave: (item: TripItem) => void; className?: string }) {
  switch (tripItem.type) {
    case 'Flight':
      return {
        view: (
          <FlightItemEdit flight={tripItem as Flight} onSave={onSave} className={className} />
        ),
        title: 'Edit Flight',
        icon: 'flight'
      }
    case 'Accommodation':
      return {
        view: (
          <div className={className}>
            <p className="text-muted-foreground">Hotel edit form (not implemented yet)</p>
          </div>
        ),
        title: 'Edit Accommodation',
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
