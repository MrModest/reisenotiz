import { DateTime, ZonedInstant } from '@/lib/datetime'
import { Person } from './person'
import { TripItem } from './trip-item'
import { TimelineElement } from '@/components/ui/timeline'
import { Address } from './address'
import { routes } from '@/lib/routes'

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

function isPast(datetime: ZonedInstant): boolean {
  return DateTime.from(datetime).isPast()
}

export function getFlightTimelineItems(flight: Flight): TimelineElement[] {
  return [
    {
      id: `${flight.id}-departure`,
      title: `Departure: ${flight.flightNumber}`,
      description: `${flight.departure.airport.name} (${flight.departure.airport.code})`,
      datetime: flight.departure.time,
      link: routes.trips.item(flight.tripId, flight.id),
      icon: 'flight-departure',
      status: isPast(flight.departure.time) ? 'inactive' : 'active',
    },
    {
      id: `${flight.id}-arrival`,
      title: `Arrival: ${flight.flightNumber}`,
      description: `${flight.arrival.airport.name} (${flight.arrival.airport.code})`,
      datetime: flight.arrival.time,
      link: routes.trips.item(flight.tripId, flight.id),
      icon: 'flight-arrival',
      status: isPast(flight.arrival.time) ? 'inactive' : 'active',
    },
  ]
}
