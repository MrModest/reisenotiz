import { formatTo } from '@/lib/datetime'
import type { Accommodation } from '@/types'
import { FieldView } from '@/components/trip-item/field-view'
import { Separator, SeparatorWithLabel } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ItemHeader } from '../item-header'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FieldChipsView } from '../field-chips-view'

interface HotelItemViewProps {
  accommodation: Accommodation
  className?: string
  onDelete: () => void
}

export function AccommodationItemView({ accommodation, className, onDelete }: HotelItemViewProps) {
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    setDeleteDialogOpen(false)
    onDelete()
  }

  return (
    <div className={cn('w-default', className)}>
      <div className='flex justify-between items-center'>
        <ItemHeader
          title={`${accommodation.site.kind} Details`}
          icon='accommodation'
          buttons={[
            { icon: 'edit', onClick: () => navigate('edit') },
            { icon: 'trash', onClick: () => setDeleteDialogOpen(true) },
          ]}
        />
      </div>
      <div className='grid grid-cols-[1fr_auto_1fr] gap-3 bg-card py-2 px-3 rounded-xs'>
        <ReservationPoint label='Check In' stayInterval={accommodation.stayInterval} />
        <Separator orientation='vertical' />
        <ReservationPoint label='Check Out' stayInterval={accommodation.stayInterval} />
      </div>
      <div className='mt-4 grid grid-cols-1 gap-2'>
        <FieldView label={`Name (${accommodation.site.kind})`} value={accommodation.site.name} />
        <FieldView
          label='Address'
          value={accommodation.site.address.line || 'Unknown'}
          subValue={`${accommodation.site.address.country}, ${accommodation.site.address.city}`}
        />
        {accommodation.site.contact && <FieldView label='Contact' value={accommodation.site.contact} />}
      </div>
      <SeparatorWithLabel label='Details' className='mt-2' />
      <div className='flex gap-2 mb-2'>
        <FieldView className='grow' label='Reserved On' value={accommodation.reservedOn || ''} />
        <FieldView className='w-18' valueVariant='align-right' label='Guests' value={accommodation.guests} />
        <FieldView className='w-18' valueVariant='align-right' label='Rooms' value={accommodation.rooms} />
      </div>

      {accommodation.attachments.length > 0 && (
        <FieldChipsView
          label='Attachments'
          icon='attachment'
          items={accommodation.attachments.map((a) => ({ value: a.name, link: a.link }))}
        />
      )}
      {accommodation.note && <FieldView label='Notes' value={accommodation.note} className='mt-2' />}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete ${accommodation.site.kind}`}
        description={
          <>
            Are you sure you want to delete <b>{accommodation.site.name}</b>?<br />
            This action cannot be undone.
          </>
        }
        onConfirm={handleDelete}
        confirmLabel='Delete'
      />
    </div>
  )
}

interface ReservationPointProps {
  label: string
  stayInterval: Accommodation['stayInterval']
}

function ReservationPoint({ label, stayInterval }: ReservationPointProps) {
  const time =
    label === 'Check In'
      ? stayInterval.planned?.in || stayInterval.provided.in
      : stayInterval.planned?.out || stayInterval.provided.out

  return (
    <div className={cn('flex flex-col', { 'items-end': label === 'Check Out' })}>
      <span className='text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2'>{label}</span>
      <span className='text-base font-semibold tracking-wide uppercase'>{formatTo.dayShort(time)}</span>
      <span className='text-lg'>{formatTo.time(time)}</span>
    </div>
  )
}
