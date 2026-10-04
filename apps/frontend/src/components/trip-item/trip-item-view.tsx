import { Flight, Accommodation, TripItem } from '@/types'
import { FlightItemView } from './flight/item-view'
import { AccommodationItemView } from './accommodation/item-view'

interface TripItemViewProps {
  tripItem: TripItem
  className?: string
  onDelete: () => void
}

export function TripItemView({ tripItem, className, onDelete }: TripItemViewProps) {
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
