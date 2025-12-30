import { Flight } from "@/types"

interface FlightItemEditProps {
  flight: Flight
  className?: string
}

export function FlightItemEdit({ flight, className }: FlightItemEditProps) {
  return (
    <div className={className}>Edit Flight Item</div>
  )
}
