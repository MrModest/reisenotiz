import { useDocument } from '@automerge/react'
import { useRootDocUrl } from '@/contexts/root-doc-context'
import type { RootDoc } from '@/store/automerge/types'
import { generateUUID, type AccommodationSite } from '@/types'

export type AccommodationSiteRecord = AccommodationSite & { id: string }

interface UserAccommodationsState {
  accommodations: Record<string, AccommodationSiteRecord>

  getAccommodation: (id: string) => AccommodationSiteRecord | undefined
  addAccommodation: (site: AccommodationSite) => AccommodationSiteRecord
  updateAccommodation: (id: string, site: AccommodationSite) => void
  deleteAccommodation: (id: string) => void
}

export function useUserAccommodationsStore<T>(selector: (state: UserAccommodationsState) => T): T {
  const [doc, changeDoc] = useDocument<RootDoc>(useRootDocUrl(), { suspense: true })

  const state: UserAccommodationsState = {
    accommodations: doc.userAccommodations,

    getAccommodation: (id) => doc.userAccommodations[id],

    addAccommodation: (site) => {
      const record: AccommodationSiteRecord = { ...site, id: generateUUID() }
      changeDoc((d) => {
        d.userAccommodations[record.id] = record
      })
      return record
    },

    updateAccommodation: (id, site) => {
      changeDoc((d) => {
        d.userAccommodations[id] = { ...site, id }
      })
    },

    deleteAccommodation: (id) => {
      changeDoc((d) => {
        delete d.userAccommodations[id]
      })
    },
  }

  return selector(state)
}
