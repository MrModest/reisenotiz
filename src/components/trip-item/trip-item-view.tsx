import { Flight, TripItem } from "@/types"
import { FlightItemView } from "./flight/item-view"

interface TripItemViewProps {
  tripItem: TripItem
  className?: string
}

export function TripItemView({ tripItem, className }: TripItemViewProps) {
  if (tripItem.type === 'Flight') {
    return <FlightItemView flight={tripItem as Flight} className={className} />
  }

  return (
    <div className={className}>
      <p className="text-muted-foreground">Unsupported item type: {tripItem.type}</p>
    </div>
  )
}
