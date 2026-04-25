import { Flight, Accommodation, TripItem, Trip } from '@/types'
import { useHeaderTitle, useHeaderBackButton } from '@/hooks/use-header-title'
import { FlightItemView } from './flight/item-view'
import { AccommodationItemView } from './accommodation/item-view'

interface TripItemViewProps {
  trip: Trip
  tripItem: TripItem
  className?: string
  onDelete: () => void
}

export function TripItemView({ trip, tripItem, className, onDelete }: TripItemViewProps) {
  useHeaderTitle(trip.name, 'trip')
  useHeaderBackButton(true)

  switch (tripItem.type) {
    case 'Flight':
      return <FlightItemView flight={tripItem as Flight} className={className} onDelete={onDelete} />
    case 'Accommodation':
      return (
        <AccommodationItemView accommodation={tripItem as Accommodation} className={className} onDelete={onDelete} />
      )
    default:
      return (
        <div className={className}>
          <p className='text-muted-foreground'>Unsupported item type: {tripItem.type}</p>
        </div>
      )
  }
}
