import { ZonedInstant } from "@/lib/datetime"
import { Person } from "./person"
import { TripItem } from "./trip-item"
import { TimelineElement } from "@/components/timeline"
import { Address } from "./address"

export interface Airport {
  code: string
  name: string
  address: Address
  tzone: string
}

export interface FlightPoint {
  airport: Airport
  terminal?: string
  gate?: string
  time: ZonedInstant
}

export interface Flight extends TripItem {
  type: 'Flight'
  flightNumber: string
  carrier: string
  bookingCode: string
  seat: string
  passengers: Person[]
  departure: FlightPoint
  arrival: FlightPoint
}

export function getTimelineItems(flight: Flight): TimelineElement[] {
  return [
    {
      id: `${flight.id}-departure`,
      title: `Departure: ${flight.flightNumber}`,
      description: `${flight.departure.airport.name} (${flight.departure.airport.code})`,
      datetime: flight.departure.time,
      link: `/trips/${flight.tripId}/items/${flight.id}`,
      icon: 'flight-departure'
    },
    {
      id: `${flight.id}-arrival`,
      title: `Arrival: ${flight.flightNumber}`,
      description: `${flight.arrival.airport.name} (${flight.arrival.airport.code})`,
      datetime: flight.arrival.time,
      link: `/trips/${flight.tripId}/items/${flight.id}`,
      icon: 'flight-arrival'
    }
  ]
}
