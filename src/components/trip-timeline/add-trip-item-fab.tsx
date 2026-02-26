import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Icon, IconName } from '@/components/icon'
import { routes } from '@/lib/routes'
import { TripItemType } from '@/types'

interface TripItemTypeConfig {
  type: TripItemType
  icon: IconName
  label: string
}

const tripItemTypes: TripItemTypeConfig[] = [
  { type: 'Flight', icon: 'flight', label: 'Flight' },
  { type: 'LongLandTransfer', icon: 'car', label: 'Land Transfer' },
  { type: 'PublicTransport', icon: 'train', label: 'Transport' },
  { type: 'Accommodation', icon: 'accommodation', label: 'Accommodation' },
  { type: 'POI', icon: 'map-pin', label: 'Point of Interest' },
]

interface AddTripItemFabProps {
  tripId: string
}

export function AddTripItemFab({ tripId }: AddTripItemFabProps) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleToggle = () => {
    setIsOpen(prev => !prev)
  }

  const handleTypeSelect = (type: TripItemType) => {
    navigate(routes.trips.newItem(tripId, type))
    setIsOpen(false)
  }

  const handleBackdropClick = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='fixed inset-0 bg-black/20 z-40'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          />
        )}
      </AnimatePresence>

      <div className='fixed bottom-20 md:bottom-4 right-4 z-50'>
        <motion.div
          className='flex flex-col gap-2 items-end'
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
        >
          <motion.div
            className='flex flex-col-reverse gap-2'
            variants={{
              open: { opacity: 1, y: 0, pointerEvents: 'auto' },
              closed: { opacity: 0, y: 20, pointerEvents: 'none' },
            }}
            transition={{ duration: 0.2 }}
          >
            {tripItemTypes.map((item, index) => (
              <motion.div
                key={item.type}
                variants={{
                  open: { opacity: 1, y: 0, scale: 1 },
                  closed: { opacity: 0, y: 20, scale: 0.8 },
                }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant='outline'
                  size='default'
                  className='w-48 justify-start gap-2 shadow-lg'
                  onClick={() => handleTypeSelect(item.type)}
                  role='menuitem'
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            className='size-12 rounded-md bg-primary text-primary-foreground shadow-lg inline-flex items-center justify-center'
            onClick={handleToggle}
            aria-label='Add trip item'
            aria-expanded={isOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon name='add' />
          </motion.button>
        </motion.div>
      </div>
    </>
  )
}
