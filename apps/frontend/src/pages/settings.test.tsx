import { describe, it, expect, vi, afterEach } from 'vitest'
import { Suspense, type ReactNode } from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { Repo, RepoContext } from '@automerge/react'
import { MemoryRouter } from 'react-router'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { HeaderProvider } from '@/contexts/header-context'
import { ROOT_DOC_KEY } from '@/store/automerge/root-doc'
import { SettingsPage } from './settings'

function setup() {
  const repo = new Repo({ network: [] })
  const rootHandle = repo.create({ tripIndex: {}, userAirports: {}, userAccommodations: {} })
  localStorage.setItem(ROOT_DOC_KEY, rootHandle.url)

  // syntactically valid automerge URL, but created in an unrelated, disconnected repo —
  // genuinely unreachable from `repo`, same as pasting another device's ID with no sync server
  const unreachableUrl = new Repo({ network: [] }).create({}).url

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter>
        <HeaderProvider>
          <RepoContext.Provider value={repo}>
            <RootDocUrlContext.Provider value={rootHandle.url}>
              <Suspense fallback={null}>{children}</Suspense>
            </RootDocUrlContext.Provider>
          </RepoContext.Provider>
        </HeaderProvider>
      </MemoryRouter>
    )
  }

  return { repo, rootHandle, unreachableUrl, wrapper }
}

describe('SettingsPage sync document ID', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('shows an error and does not persist when the pasted document is unreachable', async () => {
    const { wrapper, rootHandle, unreachableUrl } = setup()
    const Wrapper = wrapper
    render(<Wrapper><SettingsPage /></Wrapper>)

    const input = await screen.findByLabelText('Sync Document ID')
    fireEvent.change(input, { target: { value: unreachableUrl } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(
      () => expect(screen.getByText(/could not reach this document/i)).toBeDefined(),
      { timeout: 10000 },
    )
    expect(localStorage.getItem(ROOT_DOC_KEY)).toBe(rootHandle.url)
  }, 15000)
})
