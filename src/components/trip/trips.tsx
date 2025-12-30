import { Link } from "react-router"
import { Icon } from "@/components/icon"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { cn } from "@/lib/utils"
import { formatTo } from "@/lib/datetime"
import type { Trip } from "@/types"

interface TripsProps {
  trips: Trip[]
  className?: string
}

export function Trips({trips, className}: TripsProps) {
  return (
    <div className={cn("flex flex-col gap-2 md:min-w-[480px]", className)}>
      {trips.map(trip => (
        <Trip key={trip.id} trip={trip} />
      ))}
    </div>
  )
}

export function Trip({ trip }: { trip: Trip }) {
  return (
    <Item variant="outline" size="sm" asChild>
      <Link to={`/trips/${trip.id}`} key={trip.id} className="card">
        <ItemMedia>
          <Icon name="trip" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{trip.name}</ItemTitle>
          <ItemDescription>{formatTo.dateShort(trip.startDate)} - {formatTo.dateShort(trip.endDate)}</ItemDescription>
        </ItemContent>
      </Link>
    </Item>
  )
}
