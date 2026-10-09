import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { Suspense } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Repo, RepoContext } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc } from '@/store/automerge/types'
import { countryDictionary } from '@/services'
import type { Accommodation } from '@/types'
import { createAccommodationDraft } from './draft'
import { AccommodationForm } from './form'

function renderForm(onSubmit: (stay: Accommodation) => void) {
  const repo = new Repo({ network: [] })
  const rootHandle = repo.create<RootDoc>({
    ...EMPTY_ROOT_DOC,
    savedAccommodationSites: {
      'site-1': { name: 'Hotel Weisses Kreuz', kind: 'Hotel', address: { countryCode: 'AT', city: 'Innsbruck' }, tzone: 'Europe/Vienna' },
    },
  })
  render(
    <RepoContext.Provider value={repo}>
      <RootDocUrlContext.Provider value={rootHandle.url}>
        <Suspense fallback={null}>
          <AccommodationForm item={createAccommodationDraft('trip')} onSubmit={onSubmit} onCancel={() => {}} />
        </Suspense>
      </RootDocUrlContext.Provider>
    </RepoContext.Provider>,
  )
}

describe('AccommodationForm', () => {
  beforeAll(async () => {
    localStorage.setItem(
      'dict:countries',
      JSON.stringify({ fetchedAt: new Date().toISOString(), data: { AT: { code: 'AT', name: 'Austria' } } }),
    )
    await countryDictionary.load()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('keeps Save disabled until a field changes', async () => {
    renderForm(vi.fn())
    const save = await screen.findByRole('button', { name: 'Save' })
    expect(save).toHaveProperty('disabled', true)

    fireEvent.change(screen.getByLabelText('Reserved by'), { target: { value: 'Anna Weber' } })
    await waitFor(() => expect(save).toHaveProperty('disabled', false))
  })

  it('submits the stay linked to the saved site it picks, anchored to its zone', async () => {
    const onSubmit = vi.fn()
    renderForm(onSubmit)

    // Base UI opens the list only on typing, which carries an inputType
    fireEvent.input(await screen.findByLabelText('Property'), { target: { value: 'Weis' }, inputType: 'insertText' })
    fireEvent.click(await screen.findByRole('option', { name: /Hotel Weisses Kreuz/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    const stay: Accommodation = onSubmit.mock.calls[0][0]
    expect(stay.placeKey).toBe('site-1')
    expect(stay.stayInterval.provided.in).toEqual(stay.stayInterval.provided.out)
    expect(stay.stayInterval.provided.in.zone).toBe('Europe/Vienna')
    expect(stay.stayInterval.planned).toBeUndefined()
  })
})
