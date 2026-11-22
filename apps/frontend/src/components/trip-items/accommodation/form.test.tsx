import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { Suspense } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Repo, RepoContext } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc } from '@/store/automerge/types'
import { countryDictionary } from '@/services'
import type { Accommodation, AccommodationSite } from '@/types'
import { createAccommodationDraft } from './draft'
import { AccommodationForm } from './form'

const kreuz: AccommodationSite = {
  id: 'custom:kreuz',
  type: 'AccommodationSite',
  name: 'Hotel Weisses Kreuz',
  kind: 'Hotel',
  address: { countryCode: 'AT', city: 'Innsbruck' },
  tzone: 'Europe/Vienna',
}

function renderForm(onSubmit: (stay: Accommodation) => void) {
  const repo = new Repo({ network: [] })
  const rootHandle = repo.create<RootDoc>({ ...EMPTY_ROOT_DOC, savedPlaces: { 'custom:kreuz': kreuz } })
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

  it('submits a copy of the saved site it picks, anchored to its zone', async () => {
    const onSubmit = vi.fn()
    renderForm(onSubmit)

    // Base UI opens the list only on typing, which carries an inputType
    fireEvent.input(await screen.findByLabelText('Property'), { target: { value: 'Weis' }, inputType: 'insertText' })
    fireEvent.click(await screen.findByRole('option', { name: /Hotel Weisses Kreuz.*Saved/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    const stay: Accommodation = onSubmit.mock.calls[0][0]
    expect(stay.place).toEqual(kreuz)
    expect(stay.stayInterval.provided.in).toEqual(stay.stayInterval.provided.out)
    expect(stay.stayInterval.provided.in.zone).toBe('Europe/Vienna')
    expect(stay.stayInterval.planned).toBeUndefined()
  })

  it("shows the property's fields while it is blank, and only its preview once a site is picked", async () => {
    renderForm(vi.fn())
    expect(await screen.findByLabelText(/Name/)).toBeTruthy()

    fireEvent.input(screen.getByLabelText('Property'), { target: { value: 'Weis' }, inputType: 'insertText' })
    fireEvent.click(await screen.findByRole('option', { name: /Hotel Weisses Kreuz/ }))

    expect(await screen.findByText('Hotel Weisses Kreuz · Hotel')).toBeTruthy()
    expect(screen.queryByLabelText(/Name/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect((screen.getByLabelText(/Name/) as HTMLInputElement).value).toBe('Hotel Weisses Kreuz')
  })

  it('shows the plan fields only after Add plan, starting from the booking, and Clear removes them', async () => {
    const onSubmit = vi.fn()
    renderForm(onSubmit)
    fireEvent.input(await screen.findByLabelText('Property'), { target: { value: 'Weis' }, inputType: 'insertText' })
    fireEvent.click(await screen.findByRole('option', { name: /Hotel Weisses Kreuz/ }))
    const add = await screen.findByRole('button', { name: 'Add plan' })
    expect(screen.queryByLabelText('You arrive')).toBeNull()

    fireEvent.click(add)
    const arriveAt = (await screen.findAllByLabelText('At'))[0] as HTMLInputElement
    expect(arriveAt.value).toBe((screen.getByLabelText('From') as HTMLInputElement).value)

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    await waitFor(() => expect(screen.queryAllByLabelText('At')).toHaveLength(0))
    expect(screen.getByRole('button', { name: 'Add plan' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0].stayInterval.planned).toBeUndefined()
  })
})
