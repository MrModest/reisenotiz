import { DateTime, ZonedInstant } from "@/lib/datetime"
import { TripItem } from "./trip-item"
import { TimelineElement } from "@/components/timeline"
import { Address } from "./address"

export interface HotelReservation {
  checkIn: { available: ZonedInstant; planned?: ZonedInstant }
  checkOut: { available: ZonedInstant; planned?: ZonedInstant }
}

export interface Hotel extends TripItem {
  type: 'Hotel'
  name: string
  address: Address
  contact: string
  reservedOn: string
  guests: number
  rooms: number
  reservation: HotelReservation
}

function isPast(datetime: ZonedInstant): boolean {
  return DateTime.from(datetime).isPast()
}

export function getHotelTimelineItems(hotel: Hotel): TimelineElement[] {
  return [
    {
      id: `${hotel.id}-checkin`,
      title: `Check-In: ${hotel.name}`,
      description: `${hotel.address.line}`,
      datetime: hotel.reservation.checkIn.planned || hotel.reservation.checkIn.available,
      link: `/trips/${hotel.tripId}/items/${hotel.id}`,
      icon: 'hotel-checkIn',
      color: isPast(hotel.reservation.checkIn.planned || hotel.reservation.checkIn.available) ? 'muted' : 'primary'
    },
    {
      id: `${hotel.id}-checkout`,
      title: `Check-Out: ${hotel.name}`,
      description: `${hotel.address.line}`,
      datetime: hotel.reservation.checkOut.planned || hotel.reservation.checkOut.available,
      link: `/trips/${hotel.tripId}/items/${hotel.id}`,
      icon: 'hotel-checkOut',
      color: isPast(hotel.reservation.checkOut.planned || hotel.reservation.checkOut.available) ? 'muted' : 'primary'
    }
  ]
}
