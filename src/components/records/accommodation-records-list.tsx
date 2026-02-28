import { useState } from 'react'
import { userRecords } from '@/store'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icon'
import { getCountryFlag } from '@/lib/utils/country-flag'
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item'
import { AccommodationRecordDialog } from './accommodation-record-dialog'
import type { AccommodationSiteRecord } from '@/store/user-records/accommodations'

export function AccommodationRecordsList() {
  const accommodations = userRecords.useAccommodations((s) => s.accommodations)
  const deleteAccommodation = userRecords.useAccommodations((s) => s.deleteAccommodation)
  const [editingAccommodation, setEditingAccommodation] = useState<AccommodationSiteRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const accommodationList = Object.values(accommodations)

  function handleEdit(accommodation: AccommodationSiteRecord) {
    setEditingAccommodation(accommodation)
    setDialogOpen(true)
  }

  function handleAdd() {
    setEditingAccommodation(null)
    setDialogOpen(true)
  }

  function handleDialogClose() {
    setDialogOpen(false)
    setEditingAccommodation(null)
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-end'>
        <Button variant='outline' size='sm' onClick={handleAdd}>
          <Icon name='add' />
          Add Accommodation
        </Button>
      </div>

      {accommodationList.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-8 text-muted-foreground'>
          <Icon name='accommodation' className='size-8 opacity-50' />
          <p className='text-sm'>No custom accommodations yet</p>
          <p className='text-xs'>Add your own accommodation records to use in accommodation forms</p>
        </div>
      ) : (
        <ItemGroup>
          {accommodationList.map((accommodation) => {
            const flag = accommodation.address?.country
              ? getCountryFlag(accommodation.address.country)
              : ''

            return (
              <Item key={accommodation.id} variant='outline'>
                <ItemContent>
                  <ItemTitle>
                    {flag && <span>{flag}</span>}
                    {accommodation.name}
                  </ItemTitle>
                  <ItemDescription>
                    {accommodation.kind}
                    {[accommodation.address?.city, accommodation.address?.country]
                      .filter(Boolean)
                      .map((s) => ` · ${s}`)
                      .join('')}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    onClick={() => handleEdit(accommodation)}
                  >
                    <Icon name='edit' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    onClick={() => deleteAccommodation(accommodation.id)}
                  >
                    <Icon name='trash' />
                  </Button>
                </ItemActions>
              </Item>
            )
          })}
        </ItemGroup>
      )}

      <AccommodationRecordDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        accommodation={editingAccommodation}
      />
    </div>
  )
}
