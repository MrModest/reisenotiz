import { DateTime } from '@/lib/datetime'
import { routes } from '@/lib/routes'
import type { Flight } from '@/types'
import type { TripItemModule } from '../module'
import { createFlightDraft } from './draft'
import { FlightForm } from './form'
import { FlightView } from './view'

export const flightModule: TripItemModule<Flight> = {
  type: 'Flight',
  label: 'Flight',
  icon: 'flight',
  createDraft: createFlightDraft,
  toTimelineElements: (flight) => [
    {
      id: `${flight.id}-departure`,
      title: `Departure: ${flight.flightNumber}`,
      description: `${flight.departure.airport.name} (${flight.departure.airport.code})`,
      datetime: flight.departure.time,
      link: routes.trips.item(flight.tripId, flight.id),
      icon: 'flight-departure',
      status: DateTime.from(flight.departure.time).isPast() ? 'inactive' : 'active',
    },
    {
      id: `${flight.id}-arrival`,
      title: `Arrival: ${flight.flightNumber}`,
      description: `${flight.arrival.airport.name} (${flight.arrival.airport.code})`,
      datetime: flight.arrival.time,
      link: routes.trips.item(flight.tripId, flight.id),
      icon: 'flight-arrival',
      status: DateTime.from(flight.arrival.time).isPast() ? 'inactive' : 'active',
    },
  ],
  View: FlightView,
  Form: FlightForm,
}
