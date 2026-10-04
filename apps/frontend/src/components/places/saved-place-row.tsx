import { ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'

interface SavedPlaceRowProps {
  name: string
  meta: string
  address: string
}

// Name and address one line each; `min-w-0` lets them truncate instead of pushing the actions out
export function SavedPlaceRow({ name, meta, address }: SavedPlaceRowProps) {
  return (
    <ItemContent className='min-w-0'>
      <ItemTitle className='block w-full truncate text-sm'>
        <span className='mr-2 font-mono text-xs text-muted-foreground uppercase'>{meta}</span>
        {name}
      </ItemTitle>
      <ItemDescription className='truncate'>{address}</ItemDescription>
    </ItemContent>
  )
}
