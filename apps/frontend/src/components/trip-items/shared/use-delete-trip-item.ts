import { useNavigate } from 'react-router'
import { useDeleteTripItem } from '@/store'
import type { TripItem } from '@/types'

export function useDeleteTripItemAndLeave(item: TripItem) {
  const deleteTripItem = useDeleteTripItem(item.tripId)
  const navigate = useNavigate()
  return () => {
    deleteTripItem(item.id)
    navigate(-1)
  }
}
