import { Flight, Accommodation, TripItem } from "@/types"
import { useHeaderTitle, useHeaderAction } from "@/hooks/use-header-title"
import { FlightItemView } from "./flight/item-view"
import { AccommodationItemView } from "./accommodation/item-view"
import { IconName } from "@/components/icon"
import { useNavigate, useParams } from "react-router"

interface TripItemViewProps {
  tripItem: TripItem
  className?: string
}

export function TripItemView({ tripItem, className }: TripItemViewProps) {
  const result = getView({ tripItem, className })
  const navigate = useNavigate()
  const { tripId, itemId } = useParams<{ tripId: string; itemId: string }>()

  useHeaderTitle(result.title, result.icon as IconName)
  useHeaderAction([{
    icon: 'edit',
    onClick: () => {
      navigate(`/trips/${tripId}/items/${itemId}/edit`)
    }
  }])

  return result.view
}

function getView({ tripItem, className }: TripItemViewProps) {
  switch (tripItem.type) {
    case 'Flight':
      return {
        view: <FlightItemView flight={tripItem as Flight} className={className} />,
        title: 'Flight Details',
        icon: 'flight'
      }
    case 'Accommodation':
      return {
        view: <AccommodationItemView accommodation={tripItem as Accommodation} className={className} />,
        title: `${(tripItem as Accommodation).site.kind} Details`,
        icon: 'hotel-checkIn'
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
