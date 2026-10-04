import { useState } from 'react'
import { Item, ItemContent, ItemDescription, ItemTitle } from '../item'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from './base'
import { countryName } from '@/services'
import type { SavedPlaceEntry } from '@/store'

export type SavedSiteEntry = Extract<SavedPlaceEntry, { type: 'AccommodationSite' }>

const MAX_RESULTS = 50
const MIN_QUERY_LENGTH = 2

export interface AccommodationSelectorProps {
  items: SavedSiteEntry[]
  selected?: SavedSiteEntry | null
  onSelect: (accommodation: SavedSiteEntry | null) => void
}

function filterAccommodations(items: SavedSiteEntry[], query: string): SavedSiteEntry[] {
  const q = query.trim().toLowerCase()
  if (q.length < MIN_QUERY_LENGTH) return []
  return items.filter((r) => r.place.name.toLowerCase().includes(q)).slice(0, MAX_RESULTS)
}

export function AccommodationSelector({ items, selected = null, onSelect }: AccommodationSelectorProps) {
  const [query, setQuery] = useState('')

  const filtered = filterAccommodations(items, query)
  const displayItems = selected && !filtered.some((a) => a.key === selected.key)
    ? [selected, ...filtered]
    : filtered

  return (
    <Combobox
      items={displayItems}
      value={selected}
      filter={() => true}
      onInputValueChange={(val) => setQuery(val)}
      itemToStringValue={(item: SavedSiteEntry) => item.key}
      itemToStringLabel={(item: SavedSiteEntry) => item.place.name}
      isItemEqualToValue={(a, b) => a.key === b.key}
      onValueChange={(val) => {
        onSelect(val)
      }}
    >
      <ComboboxInput className='rounded-md' placeholder='Search accommodations...' showClear />
      <ComboboxContent className='rounded-xl'>
        <ComboboxEmpty>
          {query.trim().length < MIN_QUERY_LENGTH
            ? 'Type to search...'
            : 'No accommodations found.'}
        </ComboboxEmpty>
        <ComboboxList>
          {(record: SavedSiteEntry) => (
            <ComboboxItem key={record.key} value={record}>
              <Item size='xs' className='p-0'>
                <ItemContent>
                  <ItemTitle className='block w-full truncate'>{record.place.name}</ItemTitle>
                  <ItemDescription>
                    {record.place.kind} — {[record.place.address.city, countryName(record.place.address.countryCode)].filter(Boolean).join(', ')}
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
