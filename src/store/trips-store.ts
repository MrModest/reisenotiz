import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Trip, TripItem, UUID } from '@/types'
import { generateUUID } from '@/types/common/uuid'

interface TripsState {
  // Persisted State
  trips: Record<UUID, Trip>
  tripItems: Record<UUID, TripItem>

  // Selectors (use outside of useTripsStore selector to avoid infinite loops)
  getTripById: (id: UUID) => Trip | undefined
  getTripItemById: (id: UUID) => TripItem | undefined

  // CRUD Actions
  createTrip: (trip: Omit<Trip, 'id'>) => UUID
  updateTrip: (id: UUID, updates: Partial<Trip>) => void
  deleteTrip: (id: UUID) => void

  createTripItem: (item: Omit<TripItem, 'id'>) => UUID
  updateTripItem: (id: UUID, item: TripItem) => void
  deleteTripItem: (id: UUID) => void
}

export const useTripsStore = create<TripsState>()(
  persist(
    (set, get) => ({
      // Initial state
      trips: {},
      tripItems: {},

      // Selectors
      getTripById: (id) => get().trips[id],

      getTripItemById: (id) => get().tripItems[id],

      // CRUD Actions - Trips
      createTrip: (trip) => {
        const id = generateUUID()
        const newTrip: Trip = { ...trip, id }
        set((state) => ({
          trips: { ...state.trips, [id]: newTrip }
        }))
        return id
      },

      updateTrip: (id, updates) => {
        set((state) => {
          const trip = state.trips[id]
          if (!trip) return state
          return {
            trips: { ...state.trips, [id]: { ...trip, ...updates } }
          }
        })
      },

      deleteTrip: (id) => {
        set((state) => {
          const { [id]: _, ...remainingTrips } = state.trips
          // Cascade delete: remove all items belonging to this trip
          const remainingItems = Object.fromEntries(
            Object.entries(state.tripItems).filter(([, item]) => item.tripId !== id)
          )
          return {
            trips: remainingTrips,
            tripItems: remainingItems
          }
        })
      },

      // CRUD Actions - Trip Items
      createTripItem: (item) => {
        const id = generateUUID()
        const newItem = { ...item, id } as TripItem
        set((state) => ({
          tripItems: { ...state.tripItems, [id]: newItem }
        }))
        return id
      },

      updateTripItem: (id, item) => {
        set((state) => ({
          tripItems: { ...state.tripItems, [id]: item }
        }))
      },

      deleteTripItem: (id) => {
        set((state) => {
          const { [id]: _, ...remainingItems } = state.tripItems
          return { tripItems: remainingItems }
        })
      }
    }),
    {
      name: 'reisenotiz-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        trips: state.trips,
        tripItems: state.tripItems
      })
    }
  )
)
