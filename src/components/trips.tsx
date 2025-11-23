import { Link } from "react-router"
import { Icon } from "@/components/icon/icon"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"

interface TripsProps {
  trips: Trip[]
}

interface Trip {
  id: string
  title: string
  startDate: string
  endDate: string
  description: string
}

export function Trips({trips}: TripsProps) {
  return (
    <div className="flex flex-col">
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
