import { Flight, TripItem } from "@/types"
import { FlightItemView } from "./flight/item-view"
import { useHeaderTitle } from "@/hooks/use-header-title"

interface TripItemViewProps {
  tripItem: TripItem
  className?: string
}

export function TripItemView({ tripItem, className }: TripItemViewProps) {
  const result = getView({ tripItem, className })

  useHeaderTitle(result.title)

  return result.view
}

function getView({ tripItem, className }: TripItemViewProps) {
  switch (tripItem.type) {
    case 'Flight':
      return {
        view: <FlightItemView flight={tripItem as Flight} className={className} />,
        title: 'Flight Details'
      }
    default:
      return {
        view: (
          (
            <div className={className}>
              <p className="text-muted-foreground">Unsupported item type: {tripItem.type}</p>
            </div>
          )
        ),
        title: 'Unsupported Type'
      }
  }
}
