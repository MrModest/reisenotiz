import { useState } from 'react'
import { Item, ItemContent, ItemDescription, ItemTitle } from '../item'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from './base'
import type { AccommodationSiteRecord } from '@/store/user-records/accommodations'

const MAX_RESULTS = 50
const MIN_QUERY_LENGTH = 2

export interface AccommodationSelectorProps {
  items: AccommodationSiteRecord[]
  selected?: AccommodationSiteRecord | null
  onSelect: (accommodation: AccommodationSiteRecord | null) => void
}

function filterAccommodations(items: AccommodationSiteRecord[], query: string): AccommodationSiteRecord[] {
  const q = query.trim().toLowerCase()
  if (q.length < MIN_QUERY_LENGTH) return []
  return items.filter((r) => r.name.toLowerCase().includes(q)).slice(0, MAX_RESULTS)
}

export function AccommodationSelector({ items, selected = null, onSelect }: AccommodationSelectorProps) {
  const [query, setQuery] = useState('')

  const filtered = filterAccommodations(items, query)
  const displayItems = selected && !filtered.some((a) => a.id === selected.id)
    ? [selected, ...filtered]
    : filtered

  return (
    <Combobox
      items={displayItems}
      value={selected}
      filter={() => true}
      onInputValueChange={(val) => setQuery(val)}
      itemToStringValue={(item: AccommodationSiteRecord) => item.id}
      itemToStringLabel={(item: AccommodationSiteRecord) => item.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
      onValueChange={(val) => {
        onSelect(val)
      }}
    >
      <ComboboxInput className='rounded-xs' placeholder='Search accommodations...' showClear />
      <ComboboxContent className='rounded-xs'>
        <ComboboxEmpty>
          {query.trim().length < MIN_QUERY_LENGTH
            ? 'Type to search...'
            : 'No accommodations found.'}
        </ComboboxEmpty>
        <ComboboxList className='rounded-xs'>
          {(record: AccommodationSiteRecord) => (
            <ComboboxItem className='rounded-xs' key={record.id} value={record}>
              <Item size='xs' className='p-0'>
                <ItemContent>
                  <ItemTitle className='whitespace-nowrap'>
                    {record.name}
                  </ItemTitle>
                  <ItemDescription>
                    {record.kind} — {[record.address.city, record.address.country].filter(Boolean).join(', ')}
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
