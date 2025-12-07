import { Icon } from "@/components/icon"
import {
  Item,
  ItemFooter,
  ItemHeader,
} from "@/components/ui/item"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Flight } from "@/types"

interface FlightItemViewProps {
  flight: Flight
  className?: string
}

export function FlightItemView({ flight, className }: FlightItemViewProps) {
  const departureDate = new Date(flight.departure.time.instant)
  const arrivalDate = new Date(flight.arrival.time.instant)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    })
  }

  const calculateDuration = () => {
    const diff = arrivalDate.getTime() - departureDate.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getTimezoneOffset = (timezone: string) => {
    const now = new Date()
    const utcOffset = now.getTimezoneOffset()
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
    const tzOffset = (tzDate.getTime() - now.getTime()) / (1000 * 60) + utcOffset
    const hours = Math.floor(Math.abs(tzOffset) / 60)
    const sign = tzOffset >= 0 ? '+' : '-'
    return `UTC${sign}${hours}`
  }

  return (
    <Item variant="outline" className={cn("flex-col gap-6", className)}>
      {/* Flight Route Header */}
      <ItemHeader className="justify-center">
        <div className="flex w-full max-w-2xl items-start justify-between gap-4">
          {/* Departure */}
          <div className="flex flex-col items-start flex-1">
            <div className="text-lg font-semibold">
              {flight.departure.airport.code}, {flight.departure.airport.city}
            </div>
            <div className="text-4xl font-bold mt-1">
              {formatTime(departureDate)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatDate(departureDate)}
            </div>
            <div className="text-xs text-muted-foreground">
              ({getTimezoneOffset(flight.departure.time.zone)})
            </div>
          </div>

          {/* Arrow with duration */}
          <div className="flex flex-col items-center justify-center pt-8 px-4">
            <Icon name="arrow-right" className="size-6 text-muted-foreground" />
            <div className="text-xs text-muted-foreground mt-2">
              {calculateDuration()}
            </div>
          </div>

          {/* Arrival */}
          <div className="flex flex-col items-end flex-1">
            <div className="text-lg font-semibold text-right">
              {flight.arrival.airport.code}, {flight.arrival.airport.city}
            </div>
            <div className="text-4xl font-bold mt-1">
              {formatTime(arrivalDate)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatDate(arrivalDate)}
            </div>
            <div className="text-xs text-muted-foreground">
              ({getTimezoneOffset(flight.arrival.time.zone)})
            </div>
          </div>
        </div>
      </ItemHeader>

      {/* Flight Details Grid */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-4">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-muted-foreground">Carrier</div>
          <div className="text-lg font-semibold">{flight.carrier}</div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-sm text-muted-foreground">Flight Number</div>
          <div className="text-lg font-semibold">{flight.flightNumber}</div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-sm text-muted-foreground">Booking</div>
          <div className="text-lg font-semibold">{flight.bookingCode}</div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-sm text-muted-foreground">Seats</div>
          <div className="text-lg font-semibold">{flight.seat}</div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-sm text-muted-foreground">Check-in</div>
          <div className="text-base font-medium flex items-center gap-2">
            <Icon name="check-circle" className="size-4 text-green-600" />
            <span>Available Online</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-sm text-muted-foreground">Visa</div>
          <div className="text-base font-medium flex items-center gap-2">
            <Icon name="warning" className="size-4 text-amber-600" />
            <span>Required</span>
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <ItemFooter className="justify-start gap-8 pt-2 border-t">
        <div className="flex items-center gap-2">
          <Icon name="flight-checkin" className="size-5" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Check-In</span>
            <span className="text-xs text-muted-foreground">Ended</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Icon name="luggage" className="size-5" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Luggage</span>
            <span className="text-xs text-muted-foreground">Ended</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Icon name="boarding" className="size-5" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Boarding</span>
            <span className="text-xs text-muted-foreground">Ended</span>
          </div>
        </div>
      </ItemFooter>

      {/* Airport Details Tabs */}
      <Tabs defaultValue="departure" className="pt-4 border-t">
        <TabsList>
          <TabsTrigger value="departure">
            <Icon name="flight-departure" className="size-4 mr-2" />
            Departure
          </TabsTrigger>
          <TabsTrigger value="arrival">
            <Icon name="flight-arrival" className="size-4 mr-2" />
            Arrival
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departure">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">Airport</div>
              <div className="text-lg font-semibold">{flight.departure.airport.name}</div>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div className="flex flex-col gap-1">
                <div className="text-sm text-muted-foreground">Terminal</div>
                <div className="text-lg font-semibold">{flight.departure.terminal}</div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-sm text-muted-foreground">Gate</div>
                <div className="text-lg font-semibold">{flight.departure.gate}</div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">Address</div>
              <div className="text-base">{flight.departure.airport.city}, {flight.departure.airport.country}</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="arrival">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">Airport</div>
              <div className="text-lg font-semibold">{flight.arrival.airport.name}</div>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div className="flex flex-col gap-1">
                <div className="text-sm text-muted-foreground">Terminal</div>
                <div className="text-lg font-semibold">{flight.arrival.terminal}</div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-sm text-muted-foreground">Gate</div>
                <div className="text-lg font-semibold">{flight.arrival.gate}</div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">Address</div>
              <div className="text-base">{flight.arrival.airport.city}, {flight.arrival.airport.country}</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Item>
  )
}
