import { Link } from "react-router"
import { Icon } from "@/components/icon/icon"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { cn } from "@/lib/utils"

interface TripsProps {
  trips: Trip[]
  className?: string
}

interface Trip {
  id: string
  title: string
  startDate: string
  endDate: string
  description: string
}

export function Trips({trips, className}: TripsProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {trips.map(trip => (
        <Trip key={trip.id} trip={trip} />
      ))}
    </div>
  )
}

export function Trip({ trip }: { trip: Trip }) {
  return (
    <Item variant="outline" size="sm" asChild>
      <Link to={`/trips/${trip.id}`} key={trip.id}>
        <ItemMedia>
          <Icon name="trip" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{trip.title}</ItemTitle>
          <ItemDescription>{trip.startDate} - {trip.endDate}</ItemDescription>
        </ItemContent>
      </Link>
    </Item>
  )
}
