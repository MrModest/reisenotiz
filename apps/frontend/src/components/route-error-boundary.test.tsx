import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Suspense } from 'react'
import { render, screen, cleanup, waitFor, act } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import {
  Repo,
  RepoContext,
  MessageChannelNetworkAdapter,
  generateAutomergeUrl,
  type AutomergeUrl,
} from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc, type TripDoc } from '@/store/automerge/types'
import { TripTimelinePage } from '@/pages/trip-timeline'
import { DateTime, TZ } from '@/lib/datetime'
import { RouteErrorBoundary } from './route-error-boundary'

function tripDoc(id: string): TripDoc {
  const day = (d: number) => DateTime.fromObject({ year: 2026, month: 5, day: d }, TZ.local()).toZonedInstant()
  return { trip: { id, name: 'Berlin trip', description: '', startDate: day(1), endDate: day(7) }, tripItems: {} }
}

function renderTimeline(repo: Repo, tripIndex: Record<string, AutomergeUrl>, tripId = 'trip-1') {
  const root = repo.create<RootDoc>({ ...EMPTY_ROOT_DOC, tripIndex })
  const router = createMemoryRouter(
    [
      {
        path: '/trips/:tripId',
        ErrorBoundary: RouteErrorBoundary,
        element: <Suspense fallback={null}><TripTimelinePage /></Suspense>,
      },
    ],
    { initialEntries: [`/trips/${tripId}`] },
  )
  render(
    <RepoContext.Provider value={repo}>
      <RootDocUrlContext.Provider value={root.url}>
        <RouterProvider router={router} />
      </RootDocUrlContext.Provider>
    </RepoContext.Provider>,
  )
}

function peerOn(port: MessagePort) {
  const adapter = new MessageChannelNetworkAdapter(port)
  new Repo({ network: [adapter], sharePolicy: async () => true })
  return adapter
}

describe('RouteErrorBoundary state selection', () => {
  const reload = vi.fn()
  const originalLocation = window.location

  beforeEach(() => {
    Object.defineProperty(window, 'location', { value: { ...originalLocation, reload }, configurable: true })
    // React and React Router both log the errors these tests throw on purpose
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
    reload.mockReset()
    vi.restoreAllMocks()
    Object.defineProperty(window, 'location', { value: originalLocation, configurable: true })
  })

  it('shows the trip when its file is here', async () => {
    const repo = new Repo({ network: [] })
    const trip = repo.create<TripDoc>(tripDoc('trip-1'))
    renderTimeline(repo, { 'trip-1': trip.url })
    expect(await screen.findByRole('heading', { name: 'Berlin trip' })).toBeDefined()
  })

  it('reads Not found for an id the index does not list', async () => {
    renderTimeline(new Repo({ network: [] }), {})
    expect(await screen.findByRole('heading', { name: 'Not found' })).toBeDefined()
  })

  it('waits for a trip file that has not arrived and reloads once when sync connects', async () => {
    const first = new MessageChannel()
    const second = new MessageChannel()
    const repo = new Repo({
      network: [new MessageChannelNetworkAdapter(first.port1), new MessageChannelNetworkAdapter(second.port1)],
      sharePolicy: async () => true,
    })
    renderTimeline(repo, { 'trip-1': generateAutomergeUrl() })

    expect(await screen.findByText(/hasn't reached this device yet/)).toBeDefined()
    expect(screen.queryByRole('button')).toBeNull()
    expect(reload).not.toHaveBeenCalled()

    const peer = peerOn(first.port2)
    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1))

    // the connection flaps: down, then up again through another peer
    act(() => peer.disconnect())
    peerOn(second.port2)
    await act(() => new Promise((resolve) => setTimeout(resolve, 200)))
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('shows a plain error with Reload and never the internal message', async () => {
    renderTimeline(new Repo({ network: [] }), { 'trip-1': 'automerge:not-a-document' as AutomergeUrl })

    expect(await screen.findByRole('button', { name: 'Reload' })).toBeDefined()
    expect(screen.queryByText(/automerge:not-a-document/)).toBeNull()
    expect(screen.queryByText(/hasn't reached this device yet/)).toBeNull()
    expect(console.error).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('automerge:not-a-document') }))
  })
})
