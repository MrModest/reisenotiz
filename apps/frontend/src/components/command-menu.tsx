/* eslint-disable react-refresh/only-export-components */
import { Suspense, createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Loader } from '@/components/ui/loader'
import { IconName } from '@/components/icon'
import { useTrips } from '@/store'
import { routes } from '@/lib/routes'

const LIST_ID = 'command-menu-list'

interface CommandEntry {
  id: string
  label: string
  group: string
  icon: IconName
  to: string
}

const NAVIGATION_COMMANDS: CommandEntry[] = [
  { id: 'go-home', label: 'Home', group: 'Go to', icon: 'home', to: routes.root },
  { id: 'go-trips', label: 'Trips', group: 'Go to', icon: 'trip', to: routes.trips.list() },
  { id: 'go-records', label: 'Records', group: 'Go to', icon: 'document', to: routes.records.root },
  { id: 'go-airports', label: 'Airport records', group: 'Go to', icon: 'flight', to: routes.records.airports },
  {
    id: 'go-accommodations',
    label: 'Accommodation records',
    group: 'Go to',
    icon: 'accommodation',
    to: routes.records.accommodations,
  },
  { id: 'go-settings', label: 'Settings', group: 'Go to', icon: 'settings', to: routes.settings },
]

const CommandMenuContext = createContext<{ openCommandMenu: () => void } | null>(null)

export function useCommandMenu() {
  const context = useContext(CommandMenuContext)
  if (!context) {
    throw new Error('useCommandMenu must be used within a CommandMenu')
  }
  return context
}

export function CommandMenu({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'k' && event.key !== 'K') return
      if (!event.metaKey && !event.ctrlKey) return

      event.preventDefault()
      setOpen((current) => !current)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const value = useMemo(() => ({ openCommandMenu: () => setOpen(true) }), [])

  return (
    <CommandMenuContext value={value}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title='Command menu'
        description='Search your trips and jump to any page.'
      >
        {open && (
          <Suspense fallback={<Loader />}>
            <CommandMenuContent onClose={() => setOpen(false)} />
          </Suspense>
        )}
      </CommandDialog>
    </CommandMenuContext>
  )
}

function CommandMenuContent({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const trips = useTrips()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const entries = useMemo(() => {
    const tripEntries: CommandEntry[] = trips.map((trip) => ({
      id: `trip-${trip.id}`,
      label: trip.name,
      group: 'Trips',
      icon: 'trip',
      to: routes.trips.trip(trip.id),
    }))

    const all = [...NAVIGATION_COMMANDS, ...tripEntries]
    const search = query.trim().toLowerCase()
    if (!search) return all
    return all.filter((entry) => entry.label.toLowerCase().includes(search))
  }, [trips, query])

  const groups = useMemo(() => {
    const byGroup = new Map<string, CommandEntry[]>()
    for (const entry of entries) {
      const existing = byGroup.get(entry.group)
      if (existing) existing.push(entry)
      else byGroup.set(entry.group, [entry])
    }
    return [...byGroup.entries()]
  }, [entries])

  const activeEntry = entries[activeIndex]

  function run(entry: CommandEntry) {
    onClose()
    navigate(entry.to)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (entries.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % entries.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => (current - 1 + entries.length) % entries.length)
    } else if (event.key === 'Enter' && activeEntry) {
      event.preventDefault()
      run(activeEntry)
    }
  }

  return (
    <>
      <CommandInput
        autoFocus
        value={query}
        placeholder='Search trips and pages…'
        aria-label='Search trips and pages'
        aria-controls={LIST_ID}
        aria-activedescendant={activeEntry?.id}
        onChange={(event) => {
          setQuery(event.target.value)
          setActiveIndex(0)
        }}
        onKeyDown={handleKeyDown}
      />
      <CommandList id={LIST_ID} aria-label='Commands'>
        {entries.length === 0 ? (
          <CommandEmpty>No matching trips or pages.</CommandEmpty>
        ) : (
          groups.map(([heading, groupEntries]) => (
            <CommandGroup key={heading} heading={heading}>
              {groupEntries.map((entry) => (
                <CommandItem
                  key={entry.id}
                  id={entry.id}
                  icon={entry.icon}
                  selected={entry.id === activeEntry?.id}
                  onPointerMove={() => setActiveIndex(entries.indexOf(entry))}
                  onClick={() => run(entry)}
                >
                  {entry.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))
        )}
      </CommandList>
    </>
  )
}
