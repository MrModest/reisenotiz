import { Suspense, useState } from 'react'
import { useParams } from 'react-router'
import { getTripItemModule } from '@/components/trip-items/registry'
import { useDeleteTripItemAndLeave } from '@/components/trip-items/shared/use-delete-trip-item'
import { PageHeader } from '@/components/layout/page-header'
import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTripItem, useTripExists, useTripItemExists } from '@/store'
import { routes } from '@/lib/routes'
import type { TripItem } from '@/types'

export function TripItemViewPage() {
  const { tripId, itemId } = useParams<{ tripId: string; itemId: string }>()
  if (!tripId || !itemId) return <NotFound />
  return <TripItemViewTripGate tripId={tripId} itemId={itemId} />
}

function TripItemViewTripGate({ tripId, itemId }: { tripId: string; itemId: string }) {
  if (!useTripExists(tripId)) return <NotFound />
  return (
    <Suspense fallback={<PageHeader title='' backTo={routes.trips.trip(tripId)} />}>
      <TripItemViewItemGate tripId={tripId} itemId={itemId} />
    </Suspense>
  )
}

function TripItemViewItemGate({ tripId, itemId }: { tripId: string; itemId: string }) {
  if (!useTripItemExists(tripId, itemId)) return <NotFound tripId={tripId} />
  return <TripItemViewContent tripId={tripId} itemId={itemId} />
}

// The header names the type, never the item: the item's own name is the body's title
function TripItemViewContent({ tripId, itemId }: { tripId: string; itemId: string }) {
  const tripItem = useTripItem(tripId, itemId)
  const module = getTripItemModule(tripItem.type)

  if (!module) {
    return (
      <>
        <PageHeader title='Unknown item' backTo={routes.trips.trip(tripId)} />
        <p className='p-4 text-muted-foreground'>This app version cannot show this item type</p>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={module.label}
        icon={module.icon}
        backTo={routes.trips.trip(tripId)}
        actions={<ItemMenu item={tripItem} label={module.label} />}
      />
      <module.View item={tripItem} />
    </>
  )
}

function ItemMenu({ item, label }: { item: TripItem; label: string }) {
  const onDelete = useDeleteTripItemAndLeave(item)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant='ghost' size='icon' aria-label='Item actions' className='-mr-2 size-9 text-muted-foreground' />}>
          <Icon name='more' className='size-[18px]' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-auto'>
          <DropdownMenuItem variant='destructive' onClick={() => setConfirmOpen(true)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${label.toLowerCase()}`}
        description='This cannot be undone.'
        confirmLabel='Delete'
        onConfirm={onDelete}
      />
    </>
  )
}

function NotFound({ tripId }: { tripId?: string }) {
  return <PageHeader title='Not found' backTo={tripId ? routes.trips.trip(tripId) : routes.trips.list()} />
}
