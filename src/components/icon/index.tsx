import { DynamicIcon } from 'lucide-react/dynamic'

export type IconName = 'arrow-right'
  | 'back'
  | 'home'
  | 'inbox'
  | 'settings'
  | 'light-theme'
  | 'dark-theme'
  | 'document'
  | 'close'
  | 'luggage'
  | 'boarding'
  | 'flight'
  | 'flight-departure'
  | 'flight-arrival'
  | 'hotel-checkIn'
  | 'hotel-checkOut'
  | 'map-pin'
  | 'trip'
  | 'flight-checkin'
  | 'check-circle'
  | 'warning'
  | 'time'
  | 'calendar'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevrons-up-down'
  | 'circle-alert'
  | 'menu'
  | 'sidebar-close'
  | 'no-data'
  | 'loader'
  | 'logo'
  | 'timeline'
  | 'edit'
  | 'save'
  | 'cancel'
  | 'search'
  | 'check'
  | 'add'
  | 'car'
  | 'train'
  | 'accommodation'
  | 'trash'
  | 'chevron-down'
  | 'x'
  | 'person'
  | 'attachment'
  | 'unknown'

export function Icon ({ name, className }: { name: IconName; className?: string }) {
  const style = className

  switch (name) {
    case 'arrow-right':
      return <DynamicIcon name='move-right' className={style} />
    case 'back':
      return <DynamicIcon name='chevron-left' className={style} />
    case 'home':
      return <DynamicIcon name='house' className={style} />
    case 'inbox':
      return <DynamicIcon name='inbox' className={style} />
    case 'settings':
      return <DynamicIcon name='settings' className={style} />
    case 'light-theme':
      return <DynamicIcon name='sun' className={style} />
    case 'dark-theme':
      return <DynamicIcon name='moon' className={style} />
    case 'document':
      return <DynamicIcon name='paperclip' className={style} />
    case 'close':
      return <DynamicIcon name='circle-x' className={style} />
    case 'luggage':
      return <DynamicIcon name='luggage' className={style} />
    case 'boarding':
      return <DynamicIcon name='orbit' className={style} />
    case 'flight':
      return <DynamicIcon name='plane' className={style} />
    case 'flight-departure':
      return <DynamicIcon name='plane-takeoff' className={style} />
    case 'flight-arrival':
      return <DynamicIcon name='plane-landing' className={style} />
    case 'hotel-checkIn':
      return <DynamicIcon name='square-arrow-right-enter' className={style} />
    case 'hotel-checkOut':
      return <DynamicIcon name='square-arrow-right-exit' className={style} />
    case 'map-pin':
      return <DynamicIcon name='map-pin' className={style} />
    case 'trip':
      return <DynamicIcon name='tickets-plane' className={style} />
    case 'flight-checkin':
      return <DynamicIcon name='id-card' className={style} />
    case 'check-circle':
      return <DynamicIcon name='circle-check' className={style} />
    case 'warning':
      return <DynamicIcon name='triangle-alert' className={style} />
    case 'time':
      return <DynamicIcon name='clock-4' className={style} />
    case 'calendar':
      return <DynamicIcon name='calendar' className={style} />
    case 'chevron-left':
      return <DynamicIcon name='chevron-left' className={style} />
    case 'chevron-right':
      return <DynamicIcon name='chevron-right' className={style} />
    case 'circle-alert':
      return <DynamicIcon name='circle-alert' className={style} />
    case 'menu':
      return <DynamicIcon name='panel-left' className={style} />
    case 'sidebar-close':
      return <DynamicIcon name='panel-left-close' className={style} />
    case 'no-data':
      return <DynamicIcon name='circle-question-mark' className={style} />
    case 'loader':
      return <DynamicIcon name='loader-circle' className={style} />
    case 'logo':
      return <DynamicIcon name='map' className={style} />
    case 'timeline':
      return <DynamicIcon name='calendar-fold' className={style} />
    case 'edit':
      return <DynamicIcon name='square-pen' className={style} />
    case 'save':
      return <DynamicIcon name='save' className={style} />
    case 'cancel':
      return <DynamicIcon name='ban' className={style} />
    case 'search':
      return <DynamicIcon name='search' className={style} />
    case 'check':
      return <DynamicIcon name='check' className={style} />
    case 'add':
      return <DynamicIcon name='circle-plus' className={style} />
    case 'car':
      return <DynamicIcon name='car' className={style} />
    case 'train':
      return <DynamicIcon name='train' className={style} />
    case 'accommodation':
      return <DynamicIcon name='bed' className={style} />
    case 'chevrons-up-down':
      return <DynamicIcon name='chevrons-up-down' className={style} />
    case 'trash':
      return <DynamicIcon name='trash-2' className={style} />
    case 'chevron-down':
      return <DynamicIcon name='chevron-down' className={style} />
    case 'x':
      return <DynamicIcon name='x' className={style} />
    case 'person':
      return <DynamicIcon name='user' className={style} />
    case 'attachment':
      return <DynamicIcon name='paperclip' className={style} />
    case 'unknown':
    default:
      return <DynamicIcon name='shield-question-mark' className={style} />
  }
}
