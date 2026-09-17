import { describe, it, expect, afterEach } from 'vitest'
import { Suspense, type ReactNode } from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { Repo, RepoContext } from '@automerge/react'
import { MemoryRouter, useLocation } from 'react-router'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc, type TripDoc } from '@/store/automerge/types'
import { DateTime, TZ } from '@/lib/datetime'
import { CommandMenu, useCommandMenu } from './command-menu'

function tripDoc(name: string): TripDoc {
  const zone = TZ.local()
  return {
    trip: {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      description: '',
      startDate: DateTime.fromObject({ year: 2026, month: 5, day: 1 }, zone).toZonedInstant(),
      endDate: DateTime.fromObject({ year: 2026, month: 5, day: 7 }, zone).toZonedInstant(),
    },
    tripItems: {},
  }
}

function LocationProbe() {
  const location = useLocation()
  return <span data-testid='location'>{location.pathname}</span>
}

function OpenButton() {
  const { openCommandMenu } = useCommandMenu()
  return <button onClick={openCommandMenu}>Open menu</button>
}

function Harness() {
  return (
    <CommandMenu>
      <OpenButton />
      <LocationProbe />
    </CommandMenu>
  )
}

function setup(tripNames: string[]) {
  const repo = new Repo({ network: [] })
  const rootHandle = repo.create<RootDoc>({ ...EMPTY_ROOT_DOC })

  for (const name of tripNames) {
    const handle = repo.create<TripDoc>(tripDoc(name))
    rootHandle.change((doc) => {
      doc.tripIndex[handle.doc().trip.id] = handle.url
    })
  }

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter>
        <RepoContext.Provider value={repo}>
          <RootDocUrlContext.Provider value={rootHandle.url}>
            <Suspense fallback={null}>{children}</Suspense>
          </RootDocUrlContext.Provider>
        </RepoContext.Provider>
      </MemoryRouter>
    )
  }

  return { repo, rootHandle, wrapper }
}

function pressCommandK() {
  fireEvent.keyDown(window, { key: 'k', metaKey: true })
}

describe('CommandMenu', () => {
  afterEach(cleanup)

  it('opens on Cmd+K and closes on a second press', async () => {
    const { wrapper: Wrapper } = setup(['Berlin trip'])
    render(
      <Wrapper>
        <Harness />
      </Wrapper>,
    )

    expect(screen.queryByRole('listbox')).toBeNull()

    pressCommandK()
    expect(await screen.findByRole('listbox')).toBeTruthy()

    pressCommandK()
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('lists navigation targets and trips as actionable options', async () => {
    const { wrapper: Wrapper } = setup(['Berlin trip'])
    render(
      <Wrapper>
        <Harness />
      </Wrapper>,
    )

    pressCommandK()
    await screen.findByRole('listbox')

    expect(screen.getByRole('option', { name: /Settings/ })).toBeTruthy()
    expect(await screen.findByRole('option', { name: /Berlin trip/ })).toBeTruthy()
  })

  it('filters by query and shows an empty state when nothing matches', async () => {
    const { wrapper: Wrapper } = setup(['Berlin trip'])
    render(
      <Wrapper>
        <Harness />
      </Wrapper>,
    )

    pressCommandK()
    const input = await screen.findByRole('combobox')

    fireEvent.change(input, { target: { value: 'berl' } })
    expect(screen.getByRole('option', { name: /Berlin trip/ })).toBeTruthy()
    expect(screen.queryByRole('option', { name: /Settings/ })).toBeNull()

    fireEvent.change(input, { target: { value: 'zzzz' } })
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByRole('status').textContent).toContain('No matching')
  })

  it('navigates to the highlighted entry on Enter and closes', async () => {
    const { wrapper: Wrapper } = setup(['Berlin trip'])
    render(
      <Wrapper>
        <Harness />
      </Wrapper>,
    )

    pressCommandK()
    const input = await screen.findByRole('combobox')

    fireEvent.change(input, { target: { value: 'settings' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByTestId('location').textContent).toBe('/settings')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('opens from the header trigger as well as the hotkey', async () => {
    const { wrapper: Wrapper } = setup(['Berlin trip'])
    render(
      <Wrapper>
        <Harness />
      </Wrapper>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(await screen.findByRole('listbox')).toBeTruthy()
  })

  it('moves the active option with arrow keys', async () => {
    const { wrapper: Wrapper } = setup(['Berlin trip'])
    render(
      <Wrapper>
        <Harness />
      </Wrapper>,
    )

    pressCommandK()
    const input = await screen.findByRole('combobox')

    expect(input.getAttribute('aria-activedescendant')).toBe('go-home')

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.getAttribute('aria-activedescendant')).toBe('go-trips')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input.getAttribute('aria-activedescendant')).toBe('go-home')
  })
})
