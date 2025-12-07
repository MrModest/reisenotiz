import { ZonedInstant } from '@/lib/datetime'
import { IconName } from '@/components/icon'

export type TimelineSize = 'sm' | 'md' | 'lg'
export type TimelineStatus = 'completed' | 'in-progress' | 'pending'
export type TimelineColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive'

export interface TimelineElement {
  id: string;
  link: string;
  datetime: ZonedInstant;
  title: string;
  description: string;
  icon?: IconName;
  status?: TimelineStatus;
  color?: TimelineColor;
  size?: TimelineSize;
  loading?: boolean;
  error?: string;
}

export interface TimelineProps {
  items: TimelineElement[];
  size?: TimelineSize;
  animate?: boolean;
  iconColor?: TimelineColor;
  connectorColor?: TimelineColor;
  className?: string;
}
