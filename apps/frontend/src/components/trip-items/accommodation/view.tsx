import type { ReactNode } from 'react'
import { formatTo } from '@/lib/datetime'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { countryName } from '@/services'
import { useSavedPlace } from '@/store'
import type { Accommodation, StayInterval } from '@/types'
import { AddressLink } from '../shared/address-link'
import { AttachmentChips } from '../shared/attachment-chips'
import { DetailActions } from '../shared/detail-actions'
import { FactList, FactRow } from '../shared/fact-list'
import { NotesBlock } from '../shared/notes-block'
import { PersonChips } from '../shared/person-chips'
import { countNights, unusedNightNote } from './nights'

export function AccommodationView({ item: stay }: { item: Accommodation }) {
  const entry = useSavedPlace(stay.placeKey)
  const site = entry?.type === 'AccommodationSite' ? entry.place : undefined
  // One offset above the hero covers all of its times, which share the site's zone
  const subline =
    site &&
    [[site.address.city, countryName(site.address.countryCode)].filter(Boolean).join(', '), formatTo.utcOffset(stay.stayInterval.provided.in)].join(' · ')

  return (
    <>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='flex flex-col gap-6 p-4'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-[26px] leading-tight font-semibold wrap-anywhere'>{site?.name ?? 'Unknown place'}</h2>
            {subline && <p className='font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase'>{subline}</p>}
          </div>
          <StayHero stayInterval={stay.stayInterval} />
          <FactList>
            {stay.guests.length > 0 && (
              <FactRow label='Guests'>
                <PersonChips people={stay.guests} />
              </FactRow>
            )}
            <FactRow label='Rooms'>{stay.rooms}</FactRow>
            {stay.reservedOn && <FactRow label='Reserved by'>{stay.reservedOn.fullname}</FactRow>}
          </FactList>
          <AddressLink label='Address' place={site}>
            {site?.contact && <p className='font-mono text-[12px] text-muted-foreground'>{site.contact}</p>}
          </AddressLink>
          <NotesBlock note={stay.note} />
          <AttachmentChips attachments={stay.attachments} />
        </div>
      </div>
      <DetailActions editTo={routes.trips.editItem(stay.tripId, stay.id)} />
    </>
  )
}

// Everything here comes from the stay itself, so a dangling site link costs the hero nothing
function StayHero({ stayInterval }: { stayInterval: Accommodation['stayInterval'] }) {
  const { provided, planned } = stayInterval
  const nights = countNights(provided)
  const note = unusedNightNote(stayInterval)

  return (
    <div className='flex flex-col rounded-xl border border-border bg-card p-4'>
      <div className='flex items-center justify-between gap-3'>
        <HeroEnd label='Check-in' day={formatTo.dayShort(provided.in)} time={`From ${formatTo.time(provided.in)}`} />
        <div className='flex shrink-0 flex-col items-center'>
          <span className='text-[20px] leading-none font-semibold text-brand tabular-nums'>{nights}</span>
          <Caps>{nights === 1 ? 'Night' : 'Nights'}</Caps>
        </div>
        <HeroEnd label='Check-out' day={formatTo.dayShort(provided.out)} time={`By ${formatTo.time(provided.out)}`} end />
      </div>
      {planned && <PlannedRow planned={planned} note={note} />}
    </div>
  )
}

function HeroEnd({ label, day, time, end }: { label: string; day: string; time: string; end?: boolean }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', end && 'items-end text-right')}>
      <Caps>{label}</Caps>
      <span className='font-mono text-[13px] uppercase'>{day}</span>
      <span className='font-mono text-[11px] text-muted-foreground uppercase'>{time}</span>
    </div>
  )
}

// Never rendered empty: without a plan there is no row and no rule
function PlannedRow({ planned, note }: { planned: StayInterval; note: string | undefined }) {
  const when = (at: StayInterval['in']) => `${formatTo.dayMonth(at)} · ${formatTo.time(at)}`

  return (
    <div className='mt-3 flex flex-col gap-2 border-t border-border pt-3 font-mono text-[11px] text-brand uppercase'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex flex-col gap-0.5'>
          <Caps>You arrive</Caps>
          {when(planned.in)}
        </div>
        <div className='flex flex-col items-end gap-0.5 text-right'>
          <Caps>You leave</Caps>
          {when(planned.out)}
        </div>
      </div>
      {note && <p className='tracking-[.08em] wrap-anywhere'>{note}</p>}
    </div>
  )
}

function Caps({ children }: { children: ReactNode }) {
  return <span className='font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase'>{children}</span>
}
