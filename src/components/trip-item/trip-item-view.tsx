import { Flight, Accommodation, TripItem, Trip } from "@/types"
import { useHeaderTitle, useHeaderBackButton } from "@/hooks/use-header-title"
import { useNavigate } from "react-router"
import { FlightItemView } from "./flight/item-view"
import { AccommodationItemView } from "./accommodation/item-view"

interface TripItemViewProps {
  trip: Trip
  tripItem: TripItem
  className?: string
}

export function TripItemView({ trip, tripItem, className }: TripItemViewProps) {
  const navigate = useNavigate()

  useHeaderTitle(trip.name, 'trip')
  useHeaderBackButton(true)

  return getView({ tripItem, className })
}

function getView({ tripItem, className }: { tripItem: TripItem; className?: string }) {
  switch (tripItem.type) {
    case 'Flight':
      return (<FlightItemView flight={tripItem as Flight} className={className} />)
    case 'Accommodation':
      return (<AccommodationItemView accommodation={tripItem as Accommodation} className={className} />)
    default:
      return (
        <div className={className}>
          <p className="text-muted-foreground">Unsupported item type: {tripItem.type}</p>
        </div>
      )
  }
}
