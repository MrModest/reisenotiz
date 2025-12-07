import React from 'react'
import { Timeline, TimelineItem } from './timeline'
import { motion } from 'motion/react'
import type { TimelineElement } from './types'
import { Link } from 'react-router'
import { formatTo } from '@/lib/datetime'

interface TimelineLayoutProps {
  items: TimelineElement[];
  size?: 'sm' | 'md' | 'lg';
  iconColor?: 'primary' | 'secondary' | 'muted' | 'accent';
  customIcon?: React.ReactNode;
  animate?: boolean;
  connectorColor?: 'primary' | 'secondary' | 'muted' | 'accent';
  className?: string;
}

export const TimelineLayout = ({
  items,
  size = 'md',
  iconColor,
  customIcon,
  animate = true,
  connectorColor,
  className,
}: TimelineLayoutProps) => {
  return (
    <Timeline size={size} className={className}>
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
            className='relative block rounded-sm border border-border/40 bg-card/30 shadow-sm transition-all duration-200 hover:bg-accent/50 hover:border-border hover:shadow-md focus:bg-accent/50 focus:border-border focus:shadow-md hover:scale-[1.02] focus:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer px-4 py-4'
          >
            <TimelineItem
              date={formatTo.dateShort(item.datetime)}
              time={formatTo.time(item.datetime)}
              title={item.title}
              description={item.description}
              icon={typeof item.icon === 'function' ? item.icon() : item.icon || customIcon}
              iconColor={item.color || iconColor}
              connectorColor={item.color || connectorColor}
            />
          </Link>
        </motion.div>
      ))}
    </Timeline>
  )
}
