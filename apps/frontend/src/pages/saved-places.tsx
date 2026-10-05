import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/layout/page-header'
import { Icon } from '@/components/icon'
import { PlaceDialog } from '@/components/places/place-dialog'
import { getPlaceTypeModule, placeTypeModules } from '@/components/places/registry'
import { Button } from '@/components/ui/button'
import { ChipRow } from '@/components/ui/chip-row'
import { Item, ItemActions, ItemGroup } from '@/components/ui/item'
import { Switch } from '@/components/ui/switch'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { routes } from '@/lib/routes'
import { useSavedPlace, useSavedPlaceMutations, useSavedPlaces, type SavedPlaceEntry } from '@/store'
import type { PlaceType } from '@/types'

type Filter = PlaceType | 'ALL'

export function SavedPlacesPage() {
  useDocumentTitle('Places')
  const entries = useSavedPlaces()
  const [filter, setFilter] = useState<Filter>('ALL')
  const [showArchived, setShowArchived] = useState(false)

  const visible = entries
    .filter((e) => showArchived || !e.place.archived)
    .sort((a, b) => a.place.name.localeCompare(b.place.name))
  // A chip exists only for a type something visible has, so no filter can leave the list empty
  const present = placeTypeModules.filter((m) => visible.some((e) => e.type === m.type))
  const active = present.some((m) => m.type === filter) ? filter : 'ALL'
  const shown = active === 'ALL' ? visible : visible.filter((e) => e.type === active)

  return (
    <>
      <PageHeader title='Places'>
        <div className='flex min-w-0 items-center gap-3'>
          <ChipRow
            aria-label='Filter'
            className='flex-1'
            value={active}
            onValueChange={setFilter}
            options={[{ value: 'ALL', label: 'All' }, ...present.map((m) => ({ value: m.type, label: m.label }))]}
          />
          <label className='flex shrink-0 items-center gap-2 text-xs text-muted-foreground'>
            <Switch checked={showArchived} onCheckedChange={setShowArchived} />
            Show archived
          </label>
        </div>
      </PageHeader>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        {entries.length === 0 ? (
          <p className='p-4 text-sm text-muted-foreground'>The airports and places you use on trips appear here</p>
        ) : (
          <ItemGroup className='gap-0'>
            {shown.map((entry) => (
              <SavedPlaceItem key={`${entry.type}:${entry.key}`} entry={entry} />
            ))}
          </ItemGroup>
        )}
      </div>
      <Outlet />
    </>
  )
}

function SavedPlaceItem({ entry }: { entry: SavedPlaceEntry }) {
  const { icon, Row } = getPlaceTypeModule(entry.type)
  const { archive, restore, remove } = useSavedPlaceMutations()

  return (
    <Item role='listitem' className='flex-nowrap rounded-none border-b border-border px-4 py-1'>
      <Link
        to={routes.savedPlaces.edit(entry.key)}
        className='-mx-2 flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-md px-2 transition-colors duration-150 hover:bg-accent/50'
      >
        <Icon name={icon} className='size-4 shrink-0 text-muted-foreground' />
        <Row place={entry.place as never} />
      </Link>
      <ItemActions className='shrink-0'>
        {entry.place.archived ? (
          <Button variant='ghost' size='sm' onClick={() => restore(entry.type, entry.key)}>
            Restore
          </Button>
        ) : (
          <Button variant='ghost' size='sm' onClick={() => archive(entry.type, entry.key)}>
            Archive
          </Button>
        )}
        <Button variant='ghost' size='sm' onClick={() => remove(entry.type, entry.key)}>
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
  const { placeKey } = useParams()
  const entry = useSavedPlace(placeKey)
  return entry ? <PlaceDialog type={entry.type} placeKey={entry.key} onClose={close} /> : null
}
