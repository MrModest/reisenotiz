import { useState, useMemo } from "react"
import { Item, ItemContent, ItemDescription, ItemTitle } from "../item"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./base"
import type { Airport } from "@/types"

const MAX_RESULTS = 50
const MIN_QUERY_LENGTH = 2

export interface AirportSelectorProps {
  items: Airport[]
  onSelect: (airport: Airport | null) => void
}

function filterAirports(items: Airport[], query: string): Airport[] {
  const q = query.trim().toLowerCase()
  if (q.length < MIN_QUERY_LENGTH) return []

  const matches: Airport[] = []
  for (const airport of items) {
    if (
      airport.code.toLowerCase().includes(q) ||
      airport.name.toLowerCase().includes(q) ||
      airport.address.city.toLowerCase().includes(q) ||
      airport.address.country.toLowerCase().includes(q)
    ) {
      matches.push(airport)
      if (matches.length >= MAX_RESULTS) break
    }
  }
  return matches
}

export function AirportSelector({ items, onSelect }: AirportSelectorProps) {
  const [query, setQuery] = useState("")

  return (
    <Combobox
      items={filterAirports(items, query)}
      onInputValueChange={(value) => setQuery(value)}
      itemToStringValue={(item: Airport) => item.code}
      itemToStringLabel={(item: Airport) => item.name}
      isItemEqualToValue={(a, b) => a.code === b.code}
      onValueChange={(value) => {
        onSelect(value)
      }}
    >
      <ComboboxInput placeholder="Search airports..." />
      <ComboboxContent>
        <ComboboxEmpty>
          {query.trim().length < MIN_QUERY_LENGTH
            ? "Type to search..."
            : "No airports found."}
        </ComboboxEmpty>
        <ComboboxList>
          {(airport: Airport) => (
            <ComboboxItem key={airport.code} value={airport}>
              <Item size="xs" className="p-0">
                <ItemContent>
                  <ItemTitle className="whitespace-nowrap">
                    {airport.name}
                  </ItemTitle>
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
