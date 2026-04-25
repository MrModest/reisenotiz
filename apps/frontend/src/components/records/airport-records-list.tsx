import { useState } from 'react'
import { userRecords } from '@/store'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icon'
import { getCountryFlag } from '@/lib/utils/country-flag'
import { Item, ItemContent, ItemGroup, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/item'
import { AirportRecordDialog } from './airport-record-dialog'
import type { Airport } from '@/types'

export function AirportRecordsList() {
  const airports = userRecords.useAirports((s) => s.airports)
  const deleteAirport = userRecords.useAirports((s) => s.deleteAirport)
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const airportList = Object.values(airports)

  function handleEdit(airport: Airport) {
    setEditingAirport(airport)
    setDialogOpen(true)
  }

  function handleAdd() {
    setEditingAirport(null)
    setDialogOpen(true)
  }

  function handleDialogClose() {
    setDialogOpen(false)
    setEditingAirport(null)
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-end'>
        <Button variant='outline' size='sm' onClick={handleAdd}>
          <Icon name='add' />
          Add Airport
        </Button>
      </div>

      {airportList.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-8 text-muted-foreground'>
          <Icon name='flight' className='size-8 opacity-50' />
          <p className='text-sm'>No custom airports yet</p>
          <p className='text-xs'>Add your own airport records to use in flight forms</p>
        </div>
      ) : (
        <ItemGroup>
          {airportList.map((airport) => {
            const flag = airport.address?.country ? getCountryFlag(airport.address.country) : ''

            return (
              <Item key={airport.code} variant='outline'>
                <ItemContent>
                  <ItemTitle>
                    {flag && <span>{flag}</span>}
                    {airport.code} - {airport.name}
                  </ItemTitle>
                  <ItemDescription>
                    {[airport.address?.city, airport.address?.country].filter(Boolean).join(', ')}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button variant='ghost' size='icon-sm' onClick={() => handleEdit(airport)}>
                    <Icon name='edit' />
                  </Button>
                  <Button variant='ghost' size='icon-sm' onClick={() => deleteAirport(airport.code)}>
                    <Icon name='trash' />
                  </Button>
                </ItemActions>
              </Item>
            )
          })}
        </ItemGroup>
      )}

      <AirportRecordDialog open={dialogOpen} onClose={handleDialogClose} airport={editingAirport} />
    </div>
  )
}
