import { Flight, TripItem } from "@/types"
import { FlightItemView } from "./flight/item-view"
import { cn } from "@/lib/utils"

interface TripItemViewProps {
  tripItem: TripItem
  className?: string
}

export function TripItemView({ tripItem, className }: TripItemViewProps) {
  if (tripItem.type === 'Flight') {
    return <FlightItemView flight={tripItem as Flight} className={cn('w-full md:w-fit', className)} />
  }

  return (
    <div className={className}>
      <p className="text-muted-foreground">Unsupported item type: {tripItem.type}</p>
    </div>
  )
}
