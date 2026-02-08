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

export interface AirportSelectorProps {
  items: Airport[]
}

export function AirportSelector({ items }: AirportSelectorProps) {
  return (
    <Combobox
      items={items}
      itemToStringValue={(item: Airport) => item.code}
    >
      <ComboboxInput placeholder="Select an airport" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(airport: Airport) => (
            <ComboboxItem key={airport.code} value={airport.code}>
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
