import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/layout/page-header'
import { Icon } from '@/components/icon'
import { PlaceDialog } from '@/components/places/place-dialog'
import { getPlaceTypeModule, placeMeta, placeTypeModules } from '@/components/places/registry'
import { SavedPlaceRow } from '@/components/places/saved-place-row'
import { Button } from '@/components/ui/button'
import { ChipRow } from '@/components/ui/chip-row'
import { Item, ItemActions, ItemGroup } from '@/components/ui/item'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { routes } from '@/lib/routes'
import { formatAddress } from '@/lib/utils/format-address'
import { useSavedPlace, useSavedPlaceMutations, useSavedPlaces } from '@/store'
import type { AnyPlace, PlaceType } from '@/types'

type Filter = PlaceType | 'ALL'

export function SavedPlacesPage() {
  useDocumentTitle('Places')
  const places = useSavedPlaces()
  const [filter, setFilter] = useState<Filter>('ALL')

  const sorted = [...places].sort((a, b) => a.name.localeCompare(b.name))
  // A chip exists only for a type something saved has, so no filter can leave the list empty
  const present = placeTypeModules.filter((m) => places.some((p) => p.type === m.type))
  const active = present.some((m) => m.type === filter) ? filter : 'ALL'
  const shown = active === 'ALL' ? sorted : sorted.filter((p) => p.type === active)

  return (
    <>
      <PageHeader title='Places'>
        <ChipRow
          aria-label='Filter'
          value={active}
          onValueChange={setFilter}
          options={[{ value: 'ALL', label: 'All' }, ...present.map((m) => ({ value: m.type, label: m.label }))]}
        />
      </PageHeader>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        {places.length === 0 ? (
          <p className='p-4 text-sm text-muted-foreground'>The places you type in on trips appear here</p>
        ) : (
          <ItemGroup className='gap-0'>
            {shown.map((place) => (
              <SavedPlaceItem key={place.id} place={place} />
            ))}
          </ItemGroup>
        )}
      </div>
      <Outlet />
    </>
  )
}

// Trips hold their own copies, so deleting a saved place changes no trip
function SavedPlaceItem({ place }: { place: AnyPlace }) {
  const { icon } = getPlaceTypeModule(place.type)
  const { remove } = useSavedPlaceMutations()

  return (
    <Item role='listitem' className='flex-nowrap rounded-none border-b border-border px-4 py-1'>
      <Link
        to={routes.savedPlaces.edit(place.id)}
        className='-mx-2 flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-md px-2 transition-colors duration-150 hover:bg-accent/50'
      >
        <Icon name={icon} className='size-4 shrink-0 text-muted-foreground' />
        <SavedPlaceRow name={place.name} meta={placeMeta(place)} address={formatAddress(place.address)} />
      </Link>
      <ItemActions className='shrink-0'>
        <Button variant='ghost' size='sm' onClick={() => remove(place.id)}>
          Delete
        </Button>
      </ItemActions>
    </Item>
  )
}

// Back in history when the list opened the dialog; to the list when a shared link did
function useCloseDialog() {
  const navigate = useNavigate()
  const location = useLocation()
  return () => (location.key === 'default' ? navigate(routes.savedPlaces.list, { replace: true }) : navigate(-1))
}

export function NewPlaceDialogRoute() {
  const close = useCloseDialog()
  const type = useSearchParams()[0].get('type')
  const known = placeTypeModules.find((m) => m.type === type)
  return known ? <PlaceDialog type={known.type} onClose={close} /> : null
}

export function EditPlaceDialogRoute() {
  const close = useCloseDialog()
  const place = useSavedPlace(useParams().placeId)
  return place ? <PlaceDialog type={place.type} placeId={place.id} onClose={close} /> : null
}
