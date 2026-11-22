import { joinWith } from '@/lib/utils'
import type { ReactNode } from 'react'
import { useMapUrl } from '@/hooks/use-map-url'
import type { Place } from '@/types'
import { SectionLabel } from './field-label'

// `children` sits beneath the address
export function AddressLink({ label, place, children }: { label: string; place: Place; children?: ReactNode }) {
  return (
    <section className='flex flex-col gap-1.5'>
      <SectionLabel>{label}</SectionLabel>
      <PlaceAddress place={place}>{children}</PlaceAddress>
    </section>
  )
}

function PlaceAddress({ place, children }: { place: Place; children?: ReactNode }) {
  const url = useMapUrl(place)
  const address = joinWith(', ', [place.address.line, place.address.city])

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
