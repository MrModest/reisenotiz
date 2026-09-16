import { describe, it, expect, vi, afterEach } from 'vitest'
import { Suspense, type ReactNode } from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { Repo, RepoContext } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { ROOT_DOC_KEY } from '@/store/automerge/root-doc'
import { SyncSettings } from './settings'

function setup() {
  const repo = new Repo({ network: [] })
  const rootHandle = repo.create({ tripIndex: {}, userAirports: {}, userAccommodations: {} })
  localStorage.setItem(ROOT_DOC_KEY, rootHandle.url)

  // syntactically valid automerge URL, but created in an unrelated, disconnected repo —
  // genuinely unreachable from `repo`, same as pasting another device's ID with no sync server
  const unreachableUrl = new Repo({ network: [] }).create({}).url

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <RepoContext.Provider value={repo}>
        <RootDocUrlContext.Provider value={rootHandle.url}>
          <Suspense fallback={null}>{children}</Suspense>
        </RootDocUrlContext.Provider>
      </RepoContext.Provider>
    )
  }

  return { repo, rootHandle, unreachableUrl, wrapper }
}

describe('SyncSettings', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('shows an error and does not persist when the pasted document is unreachable', async () => {
    const { wrapper, rootHandle, unreachableUrl } = setup()
    const Wrapper = wrapper
    render(<Wrapper><SyncSettings /></Wrapper>)

    const input = await screen.findByLabelText('Sync Document ID')
    fireEvent.change(input, { target: { value: unreachableUrl } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(screen.getByText(/could not reach this document/i)).toBeDefined())
    expect(localStorage.getItem(ROOT_DOC_KEY)).toBe(rootHandle.url)
  })
})
