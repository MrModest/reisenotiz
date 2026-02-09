import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Airport } from '@/types'

interface UserAirportsState {
  airports: Record<string, Airport>

  getAirport: (code: string) => Airport | undefined
  addAirport: (airport: Airport) => void
  updateAirport: (code: string, airport: Airport) => void
  deleteAirport: (code: string) => void
}

export const useUserAirportsStore = create<UserAirportsState>()(
  persist(
    (set, get) => ({
      airports: {},

      getAirport: (code) => get().airports[code],

      addAirport: (airport) => {
        set((state) => ({
          airports: { ...state.airports, [airport.code]: airport }
        }))
      },

      updateAirport: (code, airport) => {
        set((state) => {
          const { [code]: _, ...rest } = state.airports
          return {
            airports: { ...rest, [airport.code]: airport }
          }
        })
      },

      deleteAirport: (code) => {
        set((state) => {
          const { [code]: _, ...remaining } = state.airports
          return { airports: remaining }
        })
      }
    }),
    {
      name: 'reisenotiz-user-airports',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        airports: state.airports
      })
    }
  )
)
