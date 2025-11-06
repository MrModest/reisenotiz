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
    case 'flight-departure':
      return <DynamicIcon name='plane-takeoff' className={style} />
    case 'flight-arrival':
      return <DynamicIcon name='plane-landing' className={style} />
    case 'hotel-checkIn':
      return <DynamicIcon name='hotel' className={style} />
    case 'hotel-checkOut':
      return <DynamicIcon name='hotel' className={style} />
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
    case 'unknown':
    default:
      return <DynamicIcon name='shield-question-mark' className={style} />
  }
}
