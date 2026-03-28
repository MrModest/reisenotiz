import { useMemo, useState } from 'react'
import { Item, ItemContent, ItemDescription, ItemTitle } from '../item'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from './base'

const MAX_RESULTS = 50

interface TimezoneOption {
  iana: string
  offset: string
}

function getUtcOffset(iana: string): string {
  const now = new Date()
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: iana,
    timeZoneName: 'shortOffset',
  })
  const parts = fmt.formatToParts(now)
  const tzPart = parts.find((p) => p.type === 'timeZoneName')
  return tzPart?.value ?? ''
}

function buildTimezoneOptions(): TimezoneOption[] {
  const zones = (Intl as unknown as { supportedValuesOf(key: string): string[] }).supportedValuesOf('timeZone')
  return zones.map((iana: string) => ({
    iana,
    offset: getUtcOffset(iana),
  }))
}

function filterTimezones(items: TimezoneOption[], query: string): TimezoneOption[] {
  const q = query.trim().toLowerCase()
  if (!q) return items.slice(0, MAX_RESULTS)

  const scored: { item: TimezoneOption; score: number }[] = []
  for (const item of items) {
    const iana = item.iana.toLowerCase()

    let score = 0
    if (iana.startsWith(q)) score = 3
    else if (iana.includes(q)) score = 2

    if (score > 0) scored.push({ item, score })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, MAX_RESULTS).map((s) => s.item)
}

export interface TimezoneSelectorProps {
  selected?: string | null
  onSelect: (timezone: string | null) => void
}

export function TimezoneSelector({ selected = null, onSelect }: TimezoneSelectorProps) {
  const [query, setQuery] = useState('')
  const options = useMemo(() => buildTimezoneOptions(), [])

  const selectedOption = selected
    ? options.find((o) => o.iana === selected) ?? null
    : null

  const filtered = filterTimezones(options, query)
  const displayItems = selectedOption && !filtered.some((o) => o.iana === selectedOption.iana)
    ? [selectedOption, ...filtered]
    : filtered

  return (
    <Combobox
      items={displayItems}
      value={selectedOption}
      filter={() => true}
      onInputValueChange={(val) => setQuery(val)}
      itemToStringValue={(item: TimezoneOption) => item.iana}
      itemToStringLabel={(item: TimezoneOption) => item.iana}
      isItemEqualToValue={(a, b) => a.iana === b.iana}
      onValueChange={(val) => {
        onSelect(val?.iana ?? null)
      }}
    >
      <ComboboxInput className='rounded-xs' placeholder='Search timezones...' showClear />
      <ComboboxContent className='rounded-xs'>
        <ComboboxEmpty>No timezones found.</ComboboxEmpty>
        <ComboboxList className='rounded-xs'>
          {(tz: TimezoneOption) => (
            <ComboboxItem className='rounded-xs' key={tz.iana} value={tz}>
              <Item size='xs' className='p-0'>
                <ItemContent>
                  <ItemTitle className='whitespace-nowrap'>{tz.iana}</ItemTitle>
                  <ItemDescription>{tz.offset}</ItemDescription>
                </ItemContent>
              </Item>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
