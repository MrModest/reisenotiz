import { joinWith } from '@/lib/utils'
import type { Flight, FlightPoint } from '@/types'
import type { TripItemModule } from '../module'
import { createFlightDraft } from './draft'
import { FlightForm } from './form'
import { FlightView } from './view'

// The link is the airport's IATA code, so the summary needs no lookup and survives a dangling link
const place = (point: FlightPoint) => joinWith(' ', [point.placeKey, point.terminal])

export const flightModule: TripItemModule<Flight> = {
  type: 'Flight',
  label: 'Flight',
  icon: 'flight',
  createDraft: createFlightDraft,
  toTimelineElements: (flight) => [
    {
      id: `${flight.id}-departure`,
      tripItemId: flight.id,
      type: 'Flight',
      at: flight.departure.time,
      title: flight.flightNumber,
      summary: joinWith(' · ', ['Departure', place(flight.departure), flight.seat && `Seat ${flight.seat}`]),
    },
    {
      id: `${flight.id}-arrival`,
      tripItemId: flight.id,
      type: 'Flight',
      at: flight.arrival.time,
      title: flight.flightNumber,
      summary: `Arrival · ${place(flight.arrival)}`,
    },
  ],
  View: FlightView,
  Form: FlightForm,
}
