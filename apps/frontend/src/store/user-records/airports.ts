import { useDocument } from '@automerge/react'
import { useRootDocUrl } from '@/contexts/root-doc-context'
import type { RootDoc } from '@/store/automerge/types'
import type { Airport } from '@/types'

interface UserAirportsState {
  airports: Record<string, Airport>

  getAirport: (code: string) => Airport | undefined
  addAirport: (airport: Airport) => void
  updateAirport: (code: string, airport: Airport) => void
  deleteAirport: (code: string) => void
}

export function useUserAirportsStore<T>(selector: (state: UserAirportsState) => T): T {
  const [doc, changeDoc] = useDocument<RootDoc>(useRootDocUrl(), { suspense: true })

  const state: UserAirportsState = {
    airports: doc.userAirports,

    getAirport: (code) => doc.userAirports[code],

    addAirport: (airport) => {
      changeDoc((d) => {
        d.userAirports[airport.code] = airport
      })
    },

    updateAirport: (code, airport) => {
      changeDoc((d) => {
        delete d.userAirports[code]
        d.userAirports[airport.code] = airport
      })
    },

    deleteAirport: (code) => {
      changeDoc((d) => {
        delete d.userAirports[code]
      })
    },
  }

  return selector(state)
}
