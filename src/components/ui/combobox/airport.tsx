import { useState } from 'react'
import { Item, ItemContent, ItemDescription, ItemTitle } from '../item'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from './base'
import type { Airport } from '@/types'

const MAX_RESULTS = 50
const MIN_QUERY_LENGTH = 2

export interface AirportSelectorProps {
  items: Airport[]
  selected?: Airport | null
  onSelect: (airport: Airport | null) => void
}

function scoreAirport(airport: Airport, q: string): number {
  const code = airport.code.toLowerCase()
  const name = airport.name.toLowerCase()
  const city = airport.address.city.toLowerCase()
  const country = airport.address.country.toLowerCase()

  if (code.startsWith(q)) return 7
  if (code.includes(q)) return 6
  if (name.startsWith(q)) return 5
  if (city.startsWith(q)) return 4
  if (name.includes(q)) return 3
  if (city.includes(q)) return 2
  if (country.includes(q)) return 1
  return 0
}

function filterAirports(items: Airport[], query: string): Airport[] {
  const q = query.trim().toLowerCase()
  if (q.length < MIN_QUERY_LENGTH) return []

  const scored: { airport: Airport; score: number }[] = []
  for (const airport of items) {
    const score = scoreAirport(airport, q)
    if (score > 0) scored.push({ airport, score })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, MAX_RESULTS).map((s) => s.airport)
}

export function AirportSelector({ items, selected = null, onSelect }: AirportSelectorProps) {
  const [query, setQuery] = useState('')

  const filtered = filterAirports(items, query)
  const displayItems = selected && !filtered.some((a) => a.code === selected.code)
    ? [selected, ...filtered]
    : filtered

  return (
    <Combobox
      items={displayItems}
      value={selected}
      filter={() => true} // We handle filtering ourselves (otherswise it doesn't handle ranking and it is too slow with large lists)
      onInputValueChange={(val) => setQuery(val)}
      itemToStringValue={(item: Airport) => item.code}
      itemToStringLabel={(item: Airport) => item.name}
      isItemEqualToValue={(a, b) => a.code === b.code}
      onValueChange={(val) => {
        onSelect(val)
      }}
    >
      <ComboboxInput className='rounded-xs' placeholder='Search airports...' showClear />
      <ComboboxContent className='rounded-xs'>
        <ComboboxEmpty>
          {query.trim().length < MIN_QUERY_LENGTH
            ? 'Type to search...'
            : 'No airports found.'}
        </ComboboxEmpty>
        <ComboboxList className='rounded-xs'>
          {(airport: Airport) => (
            <ComboboxItem className='rounded-xs' key={airport.code} value={airport}>
              <Item size='xs' className='p-0'>
                <ItemContent>
                  <ItemTitle className='whitespace-nowrap'>{airport.name}</ItemTitle>
                  <ItemDescription>
                    {airport.code} ({airport.address.city}, {airport.address.country})
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
