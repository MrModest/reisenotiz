import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, HTMLMotionProps } from 'motion/react'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { TimelineColor } from './types'

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
  iconsize?: 'sm' | 'md' | 'lg';
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
        'relative min-h-[600px] w-full max-w-2xl mx-auto py-8',
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
 * @extends {Omit<HTMLMotionProps<"li">, "ref">}
 */
interface TimelineItemProps extends Omit<HTMLMotionProps<'li'>, 'ref'> {
  /** Date string for the timeline item */
  date: string
  /** Time string for the timeline item */
  time: string
  /** Title of the timeline item */
  title: string
  /** Description text */
  description?: string
  /** Custom icon element */
  icon?: React.ReactNode
  /** Color theme for the icon */
  iconColor?: TimelineColor
  /** Current status of the item */
  status?: 'completed' | 'in-progress' | 'pending'
  /** Color theme for the connector line */
  connectorColor?: TimelineColor
  /** Whether to show the connector line */
  showConnector?: boolean
  /** Size of the icon */
  iconsize?: 'sm' | 'md' | 'lg'
  /** Loading state */
  loading?: boolean
  /** Error message */
  error?: string
}

function TimelineItem({
  className,
  date,
  time,
  title,
  description,
  icon,
  iconColor,
  status = 'completed',
  connectorColor,
  showConnector = true,
  iconsize,
  loading,
  error,
  initial,
  animate,
  transition,
  ...props
} : TimelineItemProps) {
  const commonClassName = cn(
    'relative w-full mb-8 last:mb-0',
    className,
  )

  // Loading State
  if (loading) {
    return (
      <motion.li
        className={commonClassName}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        role="status"
        {...props}
      >
        <div className="grid grid-cols-[minmax(auto,8rem)_auto_1fr] items-start px-4">
          <div className="pr-4 text-right">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>

          <div className="mx-3 flex flex-col items-center justify-start gap-y-2">
            <div className="relative flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-muted ring-8 ring-background">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
            {showConnector && <div className="h-full w-0.5 animate-pulse bg-muted" />}
          </div>

          <div className="flex flex-col gap-2 pl-2">
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </motion.li>
    )
  }

  // Error State
  if (error) {
    return (
      <motion.li
        className={cn(commonClassName, 'border border-destructive/50 bg-destructive/10')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        role="alert"
        {...props}
      >
        <div className="grid grid-cols-[minmax(auto,8rem)_auto_1fr] items-start px-4">
          <div className="pr-4 text-right">
            <TimelineTime className="text-destructive">{date}</TimelineTime>
            <TimelineTime className="text-destructive">{time}</TimelineTime>
          </div>

          <div className="mx-3 flex flex-col items-center justify-start gap-y-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20 ring-8 ring-background">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            {showConnector && <TimelineConnector status="pending" className="h-full" />}
          </div>

          <div className="flex flex-col gap-2 pl-2">
            <TimelineHeader>
              <TimelineTitle className="text-destructive">{title || 'Error'}</TimelineTitle>
            </TimelineHeader>
            <TimelineDescription className="text-destructive">{error}</TimelineDescription>
          </div>
        </div>
      </motion.li>
    )
  }

  const content = (
    <div
      className="grid grid-cols-[auto_auto_1fr] gap-3 items-start"
      {...(status === 'in-progress' ? { 'aria-current': 'step' } : {})}
    >
      {/* Date */}
      <div className="flex flex-col justify-start min-w-[80px]">
        <TimelineTime className="text-right pr-2">{date}</TimelineTime>
        <TimelineTime className="text-right pr-2 text-primary font-semibold">{time}</TimelineTime>
      </div>

      {/* Timeline dot and connector */}
      <div className="flex flex-col items-center">
        <div className="relative z-10">
          <TimelineIcon icon={icon} color={iconColor} iconSize={iconsize} />
        </div>
        {showConnector && (
          <div className="h-16 w-0.5 bg-border mt-2" />
        )}
      </div>

      {/* Content */}
      <TimelineContent>
        <TimelineHeader>
          <TimelineTitle>{title}</TimelineTitle>
        </TimelineHeader>
        <TimelineDescription>{description}</TimelineDescription>
      </TimelineContent>
    </div>
  )

  // Filter out Framer Motion specific props
  const {
    style,
    onDrag,
    onDragStart,
    onDragEnd,
    onAnimationStart,
    onAnimationComplete,
    transformTemplate,
    whileHover,
    whileTap,
    whileDrag,
    whileFocus,
    whileInView,
    ...filteredProps
  } = props

  return (
    <li className={commonClassName} {...filteredProps}>
      {content}
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

function TimelineConnector({ className, status = 'completed', color, ...props }: React.HTMLAttributes<HTMLDivElement> & {
  status?: 'completed' | 'in-progress' | 'pending'
  color?: 'primary' | 'secondary' | 'muted' | 'accent'
}) {
  return (<div
    className={cn(
      'w-0.5',
      {
        'bg-primary': color === 'primary' || (!color && status === 'completed'),
        'bg-muted': color === 'muted' || (!color && status === 'pending'),
        'bg-secondary': color === 'secondary',
        'bg-accent': color === 'accent',
        'bg-linear-to-b from-primary to-muted': !color && status === 'in-progress',
      },
      className,
    )}
    {...props}
  />)
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
  color = 'primary',
  iconSize = 'md',
}: {
  icon?: React.ReactNode
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive'
  iconSize?: 'sm' | 'md' | 'lg'
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

  const colorClasses = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    muted: 'bg-muted text-muted-foreground',
    accent: 'bg-accent text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full ring-8 ring-background shadow-sm',
        sizeClasses[iconSize],
        colorClasses[color],
      )}
    >
      {icon ? (
        <div className={cn('flex items-center justify-center', iconSizeClasses[iconSize])}>
          {icon}
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
