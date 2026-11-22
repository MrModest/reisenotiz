import { useState } from 'react'
import { Icon } from '@/components/icon'
import { getPlaceTypeModule, placeMeta } from '@/components/places/registry'
import { usePlaceSuggestions } from '@/hooks/use-place-suggestions'
import { MIN_QUERY_LENGTH } from '@/lib/places/search'
import { joinWith } from '@/lib/utils'
import { countryName } from '@/services'
import { isCustomPlace, type AnyPlace, type PlaceType, type PlaceTypes } from '@/types'
import { Item, ItemContent, ItemDescription, ItemTitle } from '../item'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from './base'

export interface PlaceSelectorProps<T extends PlaceType> {
  id?: string
  type: T
  selected: PlaceTypes[T] | null
  onSelect: (place: PlaceTypes[T] | null) => void
}

// Saved places and the provider's in one ranked list; a saved one carries a bookmark
export function PlaceSelector<T extends PlaceType>({ id, type, selected, onSelect }: PlaceSelectorProps<T>) {
  const [query, setQuery] = useState('')
  const suggestions = usePlaceSuggestions(type, query)
  const items = selected && !suggestions.some((p) => p.id === selected.id) ? [selected, ...suggestions] : suggestions
  const label = getPlaceTypeModule(type).label.toLowerCase()

  return (
    <Combobox
      items={items}
      value={selected}
      filter={() => true} // The suggestions are already filtered and ranked
      onInputValueChange={(val) => setQuery(val)}
      itemToStringValue={(place: AnyPlace) => place.id}
      itemToStringLabel={(place: AnyPlace) => place.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
      onValueChange={(val) => onSelect(val as PlaceTypes[T] | null)}
    >
      <ComboboxInput id={id} className='rounded-md' placeholder='Search...' showClear />
      <ComboboxContent className='rounded-xl'>
        <ComboboxEmpty>{query.trim().length < MIN_QUERY_LENGTH ? 'Type to search...' : `No ${label} found.`}</ComboboxEmpty>
        <ComboboxList>
          {(place: AnyPlace) => (
            <ComboboxItem key={place.id} value={place}>
              <Item size='xs' className='p-0'>
                <ItemContent className='min-w-0'>
                  <ItemTitle className='flex w-full items-center gap-1.5'>
                    <span className='truncate'>{place.name}</span>
                    {isCustomPlace(place) && (
                      <>
                        <Icon name='bookmark' className='size-3 shrink-0 text-muted-foreground' />
                        <span className='sr-only'>Saved</span>
                      </>
                    )}
                  </ItemTitle>
                  <ItemDescription>
                    {joinWith(' · ', [placeMeta(place), joinWith(', ', [place.address.city, countryName(place.address.countryCode)])])}
                  </ItemDescription>
                </ItemContent>
              </Item>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
