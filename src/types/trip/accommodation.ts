import { DateTime, ZonedInstant } from "@/lib/datetime"
import { TripItem } from "./trip-item"
import { TimelineElement } from "@/components/ui/timeline"
import { Address } from "./address"
import { routes } from "@/lib/routes"

export interface ReservationPoint {
  available: ZonedInstant;
  planned?: ZonedInstant
}

export const ACCOMMODATION_SITE_KINDS = [
  'Hotel',
  'Hostel',
  'Apartment',
  'Guesthouse',
  'BnB',
  'Resort',
  'Other'
] as const

export type AccommodationSiteKind = typeof ACCOMMODATION_SITE_KINDS[number]

export interface AccommodationSite {
  name: string
  kind: AccommodationSiteKind
  address: Address
  contact?: string
}

export interface Accommodation extends TripItem {
  type: 'Accommodation'
  site: AccommodationSite
  reservedOn?: string // TODO: migrate to `Person`
  guests: number // TODO: migrate to `Person[]`
  rooms: number
  reservation: {
    checkIn: ReservationPoint
    checkOut: ReservationPoint
  }
}

function isPast(datetime: ZonedInstant): boolean {
  return DateTime.from(datetime).isPast()
}

export function getHotelTimelineItems(hotel: Accommodation): TimelineElement[] {
  return [
    {
      id: `${hotel.id}-checkin`,
      title: `Check-In: ${hotel.site.name}`,
      description: `${hotel.site.address.line}`,
      datetime: hotel.reservation.checkIn.planned || hotel.reservation.checkIn.available,
      link: routes.trips.item(hotel.tripId, hotel.id),
      icon: 'hotel-checkIn',
      status: isPast(hotel.reservation.checkIn.available) ? 'inactive' : 'active'
    },
    {
      id: `${hotel.id}-checkout`,
      title: `Check-Out: ${hotel.site.name}`,
      description: `${hotel.site.address.line}`,
      datetime: hotel.reservation.checkOut.planned || hotel.reservation.checkOut.available,
      link: routes.trips.item(hotel.tripId, hotel.id),
      icon: 'hotel-checkOut',
      status: isPast(hotel.reservation.checkOut.available) ? 'inactive' : 'active',
    }
  ]
}
