import { formatTo } from '@/lib/datetime'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { useSavedPlace } from '@/store'
import type { Flight, FlightPoint } from '@/types'
import { AddressLink } from '../shared/address-link'
import { AttachmentChips } from '../shared/attachment-chips'
import { DetailActions } from '../shared/detail-actions'
import { FactList, FactRow } from '../shared/fact-list'
import { NotesBlock } from '../shared/notes-block'
import { PersonChips } from '../shared/person-chips'

export function FlightView({ item: flight }: { item: Flight }) {
  const departure = useSavedPlace(flight.departure.placeKey)
  const arrival = useSavedPlace(flight.arrival.placeKey)
  const subline = [flight.carrier, formatTo.dayShort(flight.departure.time)].filter(Boolean).join(' · ')

  return (
    <>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='flex flex-col gap-6 p-4'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-[26px] leading-tight font-semibold wrap-anywhere'>{flight.flightNumber}</h2>
            <p className='font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase'>{subline}</p>
          </div>
          <FlightHero flight={flight} />
          <FactList>
            {flight.bookingCode && <FactRow label='Booking code'>{flight.bookingCode}</FactRow>}
            {flight.seat && <FactRow label='Seat'>{flight.seat}</FactRow>}
            {flight.passengers.length > 0 && (
              <FactRow label='Passengers'>
                <PersonChips people={flight.passengers} />
              </FactRow>
            )}
          </FactList>
          <AddressLink label='Departure airport' place={departure?.place} />
          <AddressLink label='Arrival airport' place={arrival?.place} />
          <NotesBlock note={flight.note} />
          <AttachmentChips attachments={flight.attachments} />
        </div>
      </div>
      <DetailActions editTo={routes.trips.editItem(flight.tripId, flight.id)} />
    </>
  )
}

// Everything here comes from the flight itself, so a dangling airport link costs the hero nothing
function FlightHero({ flight }: { flight: Flight }) {
  return (
    <div className='flex items-start gap-3 rounded-xl border border-border bg-card p-4'>
      <HeroEnd point={flight.departure} />
      <div className='flex shrink-0 flex-col items-center gap-1.5 pt-2'>
        <span className='font-mono text-[11px] text-muted-foreground'>{formatTo.duration(flight.departure.time, flight.arrival.time)}</span>
        <span className='h-px w-16 bg-border' />
      </div>
      <HeroEnd point={flight.arrival} end />
    </div>
  )
}

// The offset sits under the code on both ends, always, so the hero has one height
function HeroEnd({ point, end }: { point: FlightPoint; end?: boolean }) {
  const where = [point.terminal, point.gate && `Gate ${point.gate}`].filter(Boolean).join(' · ')

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col', end && 'items-end text-right')}>
      <span className='font-mono text-[26px] leading-tight font-semibold'>{point.placeKey}</span>
      <span className='font-mono text-[10px] text-muted-foreground'>{formatTo.utcOffset(point.time)}</span>
      <span className='mt-2.5 font-mono text-[18px] leading-tight'>{formatTo.time(point.time)}</span>
      {where && <span className='mt-1.5 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase wrap-anywhere'>{where}</span>}
    </div>
  )
}
