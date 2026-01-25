import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type { TimelineSize, TimelineStatus } from './types'
import { Icon, IconName } from '@/components/icon'

const timelineVariants = cva('flex flex-col relative', {
  variants: {
    size: {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/**
 * Timeline component props interface
 * @interface TimelineProps
 * @extends {React.HTMLAttributes<HTMLOListElement>}
 * @extends {VariantProps<typeof timelineVariants>}
 */
interface TimelineProps extends React.HTMLAttributes<HTMLOListElement>, VariantProps<typeof timelineVariants> {
  /** Size of the timeline icons */
  iconsize?: TimelineSize;
}

/**
 * Timeline component for displaying a vertical list of events or items
 * @component
 */
function Timeline({ className, iconsize, size, children, ...props }: TimelineProps) {
  const items = React.Children.toArray(children)

  if (items.length === 0) {
    return <TimelineEmpty />
  }

  return (
    <ol
      aria-label="Timeline"
      className={cn(
        timelineVariants({ size }),
        'relative max-w-2xl py-8',
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (
          React.isValidElement(child) &&
          typeof child.type !== 'string' &&
          'displayName' in child.type &&
          child.type.displayName === 'TimelineItem'
        ) {
          return React.cloneElement(child, {
            iconsize,
            showConnector: index !== items.length - 1,
          } as React.ComponentProps<typeof TimelineItem>)
        }
        return child
      })}
    </ol>
  )
}
Timeline.displayName = 'Timeline'

/**
 * TimelineItem component props interface
 * @interface TimelineItemProps
 * @extends {React.ComponentProps<'li'>}
 */
interface TimelineItemProps extends React.ComponentProps<'li'> {
  /** Date string for the timeline item */
  date: string
  /** Time string for the timeline item */
  time: string
  /** Title of the timeline item */
  title: string
  /** Description text */
  description?: string
  /** Custom icon element */
  icon?: IconName
  /** Current status of the item */
  status?: TimelineStatus
  /** Whether to show the connector line */
  showConnector?: boolean
  /** Size of the icon */
  iconsize?: TimelineSize
}

function TimelineItem({
  className,
  date,
  time,
  title,
  description,
  icon,
  status = 'active',
  showConnector = true,
  iconsize,
  ...props
} : TimelineItemProps) {

  // Filter out Framer Motion specific props
  const {
    style,
    onDrag,
    onDragStart,
    onDragEnd,
    onAnimationStart,
    ...filteredProps
  } = props

  return (
    <li className={cn('relative w-full mb-8 last:mb-0 bg-card', className)} {...filteredProps}>
      <div className="grid grid-cols-[auto_auto_1fr] gap-3 items-start">
        {/* Date */}
        <div className="flex flex-col justify-start min-w-20">
          <TimelineTime className="text-right pr-2 text-sm">{date}</TimelineTime>
          <TimelineTime className="text-right pr-2 text-primary font-semibold text-xl">{time}</TimelineTime>
        </div>

        {/* Timeline dot and connector */}
        <div className="flex flex-col items-center">
          <div className="relative z-10">
            <TimelineIcon icon={icon} iconSize={iconsize} status={status} />
          </div>
          {showConnector && <TimelineConnector />}
        </div>

        {/* Content */}
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>{title}</TimelineTitle>
          </TimelineHeader>
          <TimelineDescription>{description}</TimelineDescription>
        </TimelineContent>
      </div>
    </li>
  )
}
TimelineItem.displayName = 'TimelineItem'

interface TimelineTimeProps extends React.HTMLAttributes<HTMLTimeElement> {
  /** Date string, Date object, or timestamp */
  date?: string | Date | number
  /** Optional format for displaying the date */
  format?: Intl.DateTimeFormatOptions
}

const defaultDateFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
}

function TimelineTime({ className, date, format, children, ...props }: TimelineTimeProps) {
  const formattedDate = React.useMemo(() => {
    if (!date) return ''

    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) return ''

      return new Intl.DateTimeFormat('en-US', {
        ...defaultDateFormat,
        ...format,
      }).format(dateObj)
    } catch (error) {
      console.error('Error formatting date:', error)
      return ''
    }
  }, [date, format])

  return (
    <time
      dateTime={date ? new Date(date).toISOString() : undefined}
      className={cn('text-sm font-medium tracking-tight text-muted-foreground', className)}
      {...props}
    >
      {children || formattedDate}
    </time>
  )
}
TimelineTime.displayName = 'TimelineTime'

function TimelineConnector() {
  return (<div className="h-16 w-0.5 bg-border mt-2" />)
}
TimelineConnector.displayName = 'TimelineConnector'

function TimelineHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (<div className={cn('flex items-center gap-4', className)} {...props} />)
}
TimelineHeader.displayName = 'TimelineHeader'

function TimelineTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>){
  return (
    <h3
      className={cn('font-semibold leading-none tracking-tight text-secondary-foreground', className)}
      {...props}
    >
      {children}
    </h3>
  )
}
TimelineTitle.displayName = 'TimelineTitle'

function TimelineIcon({
  icon,
  iconSize = 'md',
  status = 'active'
}: {
  icon?: IconName
  iconSize?: TimelineSize,
  status?: TimelineStatus
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full ring-2 ring-primary',
        sizeClasses[iconSize],
        {
          'bg-primary/90 text-primary-foreground': status === 'active',
          'bg-primary/50 text-primary': status === 'inactive',
        },
      )}
    >
      {icon ? (
        <div className={cn('flex items-center justify-center', iconSizeClasses[iconSize])}>
          <Icon name={icon} />
        </div>
      ) : (
        <div className={cn('rounded-full', iconSizeClasses[iconSize])} />
      )}
    </div>
  )
}

function TimelineDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('max-w-sm text-sm text-muted-foreground', className)} {...props} />
  )
}

TimelineDescription.displayName = 'TimelineDescription'

function TimelineContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-2 pl-2', className)} {...props} />
  )
}
TimelineContent.displayName = 'TimelineContent'

function TimelineEmpty({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return(
    <div
      className={cn('flex flex-col items-center justify-center p-8 text-center', className)}
      {...props}
    >
      <p className="text-sm text-muted-foreground">{children || 'No timeline items to display'}</p>
    </div>
  )
}
TimelineEmpty.displayName = 'TimelineEmpty'

export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineTitle,
  TimelineIcon,
  TimelineDescription,
  TimelineContent,
  TimelineTime,
  TimelineEmpty,
}
