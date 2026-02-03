import { Timeline, TimelineItem } from './timeline'
import { motion } from 'motion/react'
import type { TimelineElement } from './types'
import { Link } from 'react-router'
import { formatTo } from '@/lib/datetime'
import { IconName } from '@/components/icon'
import { cn } from '@/lib/utils'

interface TimelineLayoutProps {
  items: TimelineElement[];
  size?: 'sm' | 'md' | 'lg';
  customIcon?: IconName;
  animate?: boolean;
  className?: string;
}

export const TimelineLayout = ({
  items,
  size = 'md',
  customIcon,
  animate = true,
  className,
}: TimelineLayoutProps) => {
  return (
    <Timeline size={size} className={cn('w-default', className)}>
      {[...items].map((item, index) => (
        <motion.div
          key={item.id}
          initial={animate ? { opacity: 0, y: 20 } : false}
          animate={animate ? { opacity: 1, y: 0 } : false}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: 'easeOut',
          }}
        >
          <Link
            to={item.link}
            className='block card'
          >
            <TimelineItem
              date={formatTo.dayShort(item.datetime)}
              time={formatTo.time(item.datetime)}
              title={item.title}
              description={item.description}
              icon={item.icon || customIcon}
            />
          </Link>
        </motion.div>
      ))}
    </Timeline>
  )
}
