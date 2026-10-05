import { useMapUrl } from '@/hooks/use-map-url'
import type { Place } from '@/types'
import { SectionLabel } from './field-label'

// A link that dangles still names the block, with nothing to open
export function AddressLink({ label, place }: { label: string; place: Place | undefined }) {
  return (
    <section className='flex flex-col gap-1.5'>
      <SectionLabel>{label}</SectionLabel>
      {place ? <PlaceAddress place={place} /> : <p className='text-[15px] text-muted-foreground'>Unknown place</p>}
    </section>
  )
}

function PlaceAddress({ place }: { place: Place }) {
  const url = useMapUrl(place)
  const address = [place.address.line, place.address.city].filter(Boolean).join(', ')

  return (
    <div className='flex flex-col gap-0.5 wrap-anywhere'>
      <p className='text-[15px] font-medium'>{place.name}</p>
      <a href={url} target='_blank' rel='noopener noreferrer' className='text-[15px] text-brand underline underline-offset-4'>
        {address}
      </a>
    </div>
  )
}
