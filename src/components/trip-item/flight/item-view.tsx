import { Icon } from "@/components/icon"
import { Flight } from "@/types"

interface FlightItemViewProps {
  flight: Flight
  className?: string
}

export function FlightItemView({ flight, className }: FlightItemViewProps) {
  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_1fr]">
        <FlightPoint point={flight.departure} label="Departure" />
        <Icon name="arrow-right" className="justify-self-center" />
        <FlightPoint point={flight.arrival} label="Arrival" />
      </div>
    </div>
  )
}

function FlightPoint( { point, label }: { point: Flight['departure'] | Flight['arrival'], label: string }) {
  return (
    <div className="flight-point">
      <h3>{label}</h3>
      <p>{point.airport.name} ({point.airport.code})</p>
      <p>Terminal: {point.terminal}, Gate: {point.gate}</p>
      <p>Time: {point.time.toString()}</p>
    </div>
  )
}
