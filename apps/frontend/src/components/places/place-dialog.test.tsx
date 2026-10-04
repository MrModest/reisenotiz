import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { Suspense } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Repo, RepoContext, interpretAsDocumentId, type DocHandle } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc } from '@/store/automerge/types'
import { countryDictionary } from '@/services'
import type { AccommodationSite } from '@/types'
import { PlaceDialog } from './place-dialog'

const adlon: AccommodationSite = {
  name: 'Hotel Adlon',
  kind: 'Hotel',
  address: { countryCode: 'DE', city: 'Berlin' },
  tzone: 'Europe/Berlin',
}

function renderDialog(props: { placeKey?: string; onSaved: (key: string) => void }, saved: RootDoc['savedAccommodationSites'] = {}) {
  const repo = new Repo({ network: [] })
  const rootHandle = repo.create<RootDoc>({ ...EMPTY_ROOT_DOC, savedAccommodationSites: saved })
  render(
    <RepoContext.Provider value={repo}>
      <RootDocUrlContext.Provider value={rootHandle.url}>
        <Suspense fallback={null}>
          <PlaceDialog type='AccommodationSite' onClose={() => {}} {...props} />
        </Suspense>
      </RootDocUrlContext.Provider>
    </RepoContext.Provider>,
  )
  return () => (repo.handles[interpretAsDocumentId(rootHandle.url)] as DocHandle<RootDoc>).doc().savedAccommodationSites
}

describe('PlaceDialog', () => {
  beforeAll(async () => {
    localStorage.setItem(
      'dict:countries',
      JSON.stringify({
        fetchedAt: new Date().toISOString(),
        data: { DE: { code: 'DE', name: 'Germany' }, AT: { code: 'AT', name: 'Austria' } },
      }),
    )
    await countryDictionary.load()
    localStorage.clear()
  })

  afterEach(cleanup)

  it('adds a new place and hands its key to onSaved', async () => {
    const onSaved = vi.fn()
    const sites = renderDialog({ onSaved })

    fireEvent.change(await screen.findByLabelText(/Name/), { target: { value: 'Hotel Weisses Kreuz' } })
    fireEvent.change(screen.getByLabelText(/City/), { target: { value: 'Innsbruck' } })
    fireEvent.change(screen.getByLabelText(/Country/), { target: { value: 'AT' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce())
    const key = onSaved.mock.calls[0][0]
    expect(sites()[key]).toMatchObject({ name: 'Hotel Weisses Kreuz', address: { city: 'Innsbruck', countryCode: 'AT' } })
  })

  it('edits the place saved under its key and hands that key to onSaved', async () => {
    const onSaved = vi.fn()
    const sites = renderDialog({ placeKey: 'adlon', onSaved }, { adlon })

    const save = await screen.findByRole('button', { name: 'Save' })
    expect((save as HTMLButtonElement).disabled).toBe(true)

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Hotel Adlon Kempinski' } })
    fireEvent.click(save)

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('adlon', expect.anything()))
    expect(Object.keys(sites())).toEqual(['adlon'])
    expect(sites().adlon.name).toBe('Hotel Adlon Kempinski')
  })
})
