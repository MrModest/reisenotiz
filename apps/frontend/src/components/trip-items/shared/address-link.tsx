import type { ReactNode } from 'react'
import { useMapUrl } from '@/hooks/use-map-url'
import type { Place } from '@/types'
import { SectionLabel } from './field-label'

// A link that dangles still names the block, with nothing to open. `children` sits beneath the address.
export function AddressLink({ label, place, children }: { label: string; place: Place | undefined; children?: ReactNode }) {
  return (
    <section className='flex flex-col gap-1.5'>
      <SectionLabel>{label}</SectionLabel>
      {place ? <PlaceAddress place={place}>{children}</PlaceAddress> : <p className='text-[15px] text-muted-foreground'>Unknown place</p>}
    </section>
  )
}

function PlaceAddress({ place, children }: { place: Place; children?: ReactNode }) {
  const url = useMapUrl(place)
  const address = [place.address.line, place.address.city].filter(Boolean).join(', ')

  return (
    <div className='flex flex-col gap-0.5 wrap-anywhere'>
      <p className='text-[15px] font-medium'>{place.name}</p>
      <a href={url} target='_blank' rel='noopener noreferrer' className='text-[15px] text-brand underline underline-offset-4'>
        {address}
      </a>
      {children}
    </div>
  )
}
