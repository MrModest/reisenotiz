import { TripItem } from '@/types'
import { useHeaderTitle, useHeaderAction } from '@/hooks/use-header-title'
import { IconName } from '@/components/icon'
import { useNavigate } from 'react-router'

interface TripItemEditProps {
  tripItem: TripItem
  className?: string
}

export function TripItemEdit({ tripItem, className }: TripItemEditProps) {
  const result = getEdit({ tripItem, className })
  const navigate = useNavigate()

  useHeaderTitle(result.title, result.icon as IconName)
  useHeaderAction([{
    icon: 'save',
    onClick: () => {
      console.log('Save trip item:', tripItem.id)
    }
  }, {
    icon: 'cancel',
    onClick: () => {
      navigate(-1)
    }
  }])

  return result.view
}

function getEdit({ tripItem, className }: TripItemEditProps) {
  switch (tripItem.type) {
    case 'Flight':
      return {
        view: (
          <div className={className}>
            <p className="text-muted-foreground">Flight edit form (not implemented yet)</p>
          </div>
        ),
        title: 'Edit Flight',
        icon: 'flight'
      }
    case 'Hotel':
      return {
        view: (
          <div className={className}>
            <p className="text-muted-foreground">Hotel edit form (not implemented yet)</p>
          </div>
        ),
        title: 'Edit Accommodation',
        icon: 'hotel-checkIn'
      }
    default:
      return {
        view: (
          <div className={className}>
            <p className="text-muted-foreground">Unsupported item type: {tripItem.type}</p>
          </div>
        ),
        title: 'Unsupported Type'
      }
  }
}
