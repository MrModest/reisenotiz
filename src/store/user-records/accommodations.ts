import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AccommodationSite } from '@/types'

export type AccommodationSiteRecord = AccommodationSite & { id: string }

interface UserAccommodationsState {
  accommodations: Record<string, AccommodationSiteRecord>

  getAccommodation: (id: string) => AccommodationSiteRecord | undefined
  addAccommodation: (site: AccommodationSite) => AccommodationSiteRecord
  updateAccommodation: (id: string, site: AccommodationSite) => void
  deleteAccommodation: (id: string) => void
}

export const useUserAccommodationsStore = create<UserAccommodationsState>()(
  persist(
    (set, get) => ({
      accommodations: {},

      getAccommodation: (id) => get().accommodations[id],

      addAccommodation: (site) => {
        const record: AccommodationSiteRecord = { ...site, id: crypto.randomUUID() }
        set((state) => ({
          accommodations: { ...state.accommodations, [record.id]: record }
        }))
        return record
      },

      updateAccommodation: (id, site) => {
        set((state) => ({
          accommodations: { ...state.accommodations, [id]: { ...site, id } }
        }))
      },

      deleteAccommodation: (id) => {
        set((state) => {
          const { [id]: _, ...remaining } = state.accommodations
          return { accommodations: remaining }
        })
      }
    }),
    {
      name: 'reisenotiz-user-accommodations',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accommodations: state.accommodations
      })
    }
  )
)
