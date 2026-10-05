import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { Suspense } from 'react'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Repo, RepoContext, interpretAsDocumentId, type DocHandle } from '@automerge/react'
import { RootDocUrlContext } from '@/contexts/root-doc-context'
import { EMPTY_ROOT_DOC, type RootDoc } from '@/store/automerge/types'
import { airportDictionary, countryDictionary } from '@/services'
import type { Airport, Flight } from '@/types'
import { createFlightDraft } from './draft'
import { FlightForm } from './form'

const airport = (code: string, name: string, city: string): Airport => ({
  code,
  name,
  address: { countryCode: 'DE', city },
  tzone: 'Europe/Berlin',
})

function renderForm(onSubmit: (flight: Flight) => void) {
  const repo = new Repo({ network: [] })
  const rootHandle = repo.create<RootDoc>({ ...EMPTY_ROOT_DOC })
  render(
    <RepoContext.Provider value={repo}>
      <RootDocUrlContext.Provider value={rootHandle.url}>
        <Suspense fallback={null}>
          <FlightForm item={createFlightDraft('trip')} onSubmit={onSubmit} onCancel={() => {}} />
        </Suspense>
      </RootDocUrlContext.Provider>
    </RepoContext.Provider>,
  )
  const airports = () => (repo.handles[interpretAsDocumentId(rootHandle.url)] as DocHandle<RootDoc>).doc().savedAirports ?? {}
  return { airports }
}

async function pickAirport(group: string, query: string, name: string) {
  const input = within(await screen.findByRole('region', { name: group })).getByLabelText('Airport')
  // Base UI opens the list only on typing, which carries an inputType
  fireEvent.input(input, { target: { value: query }, inputType: 'insertText' })
  fireEvent.click(await screen.findByRole('option', { name: new RegExp(name) }))
}

describe('FlightForm', () => {
  beforeAll(async () => {
    localStorage.setItem(
      'dict:countries',
      JSON.stringify({ fetchedAt: new Date().toISOString(), data: { DE: { code: 'DE', name: 'Germany' } } }),
    )
    localStorage.setItem(
      'dict:airports-by-country-code',
      JSON.stringify({
        fetchedAt: new Date().toISOString(),
        data: { BER: airport('BER', 'Berlin Brandenburg', 'Berlin'), MUC: airport('MUC', 'Munich Airport', 'Munich') },
      }),
    )
    await countryDictionary.load()
    await airportDictionary.load()
    localStorage.clear()
  })

  afterEach(cleanup)

  it('keeps Save disabled until a field changes', async () => {
    renderForm(vi.fn())
    const save = await screen.findByRole('button', { name: 'Save' })
    expect(save).toHaveProperty('disabled', true)

    fireEvent.change(screen.getByLabelText('Flight number'), { target: { value: 'LH 1953' } })
    await waitFor(() => expect(save).toHaveProperty('disabled', false))
  })

  // #90: picking airports from the combobox used to leave Save doing nothing
  it('saves dictionary airports it picks, then submits the flight linked to them', async () => {
    const onSubmit = vi.fn()
    const { airports } = renderForm(onSubmit)

    await pickAirport('Departure', 'BER', 'Berlin Brandenburg')
    await pickAirport('Arrival', 'MUC', 'Munich Airport')
    expect(Object.keys(airports()).sort()).toEqual(['BER', 'MUC'])

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    const flight: Flight = onSubmit.mock.calls[0][0]
    expect([flight.departure.placeKey, flight.arrival.placeKey]).toEqual(['BER', 'MUC'])
    expect(flight.departure.time.zone).toBe('Europe/Berlin')
  })
})
