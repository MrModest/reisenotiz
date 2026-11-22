import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { Suspense } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Repo, RepoContext, interpretAsDocumentId, type DocHandle } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc } from '@/store/automerge/types'
import { countryDictionary } from '@/services'
import type { AccommodationSite } from '@/types'
import { PlaceDialog } from './place-dialog'

const adlon: AccommodationSite = {
  id: 'custom:adlon',
  type: 'AccommodationSite',
  name: 'Hotel Adlon',
  kind: 'Hotel',
  address: { countryCode: 'DE', city: 'Berlin' },
  tzone: 'Europe/Berlin',
}

function renderDialog(placeId?: string) {
  const repo = new Repo({ network: [] })
  const rootHandle = repo.create<RootDoc>({ ...EMPTY_ROOT_DOC, savedPlaces: { [adlon.id]: adlon } })
  render(
    <RepoContext.Provider value={repo}>
      <RootDocUrlContext.Provider value={rootHandle.url}>
        <Suspense fallback={null}>
          <PlaceDialog type='AccommodationSite' placeId={placeId} onClose={() => {}} />
        </Suspense>
      </RootDocUrlContext.Provider>
    </RepoContext.Provider>,
  )
  return { saved: () => (repo.handles[interpretAsDocumentId(rootHandle.url)] as DocHandle<RootDoc>).doc().savedPlaces }
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

  it('saves a new place under a new custom id', async () => {
    const { saved } = renderDialog()

    fireEvent.change(await screen.findByLabelText(/Name/), { target: { value: 'Hotel Weisses Kreuz' } })
    fireEvent.change(screen.getByLabelText(/City/), { target: { value: 'Innsbruck' } })
    fireEvent.change(screen.getByLabelText(/Country/), { target: { value: 'AT' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(Object.keys(saved())).toHaveLength(2))
    const added = Object.values(saved()).find((p) => p.id !== adlon.id)!
    expect(added).toMatchObject({ type: 'AccommodationSite', name: 'Hotel Weisses Kreuz', address: { city: 'Innsbruck', countryCode: 'AT' } })
    expect(added.id).toMatch(/^custom:/)
  })

  it('saves an edit over the place under its id', async () => {
    const { saved } = renderDialog(adlon.id)

    const save = await screen.findByRole('button', { name: 'Save' })
    expect((save as HTMLButtonElement).disabled).toBe(true)

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Hotel Adlon Kempinski' } })
    fireEvent.click(save)

    await waitFor(() => expect(saved()[adlon.id].name).toBe('Hotel Adlon Kempinski'))
    expect(Object.keys(saved())).toEqual([adlon.id])
  })
})
