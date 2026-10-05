import { Suspense, useState } from 'react'
import { Link, useMatch, useOutlet, useParams } from 'react-router'
import { PageHeader } from '@/components/layout/page-header'
import { Icon } from '@/components/icon'
import { SkeletonRows } from '@/components/ui/skeleton-rows'
import { getTripItemModule, presentTripItemModules, toTimelineElements } from '@/components/trip-items/registry'
import { ChipRow } from '@/components/ui/chip-row'
import { TimelineDayHeader, TimelineRow, UnknownItemRow } from '@/components/trip-timeline/timeline-row'
import { useTrip, useTripExists, useTripItems } from '@/store'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatTo } from '@/lib/datetime'
import { buildTimelineDays } from '@/lib/timeline'
import { routes } from '@/lib/routes'
import type { TripItemType } from '@/types'

export function TripTimelinePage() {
  const { tripId } = useParams<{ tripId: string }>()
  if (!tripId) return <NotFound />
  return <TripTimelineSplit tripId={tripId} />
}

// The item routes render into the pane, which exists exactly when one is active; `AppShell` sizes it
function TripTimelineSplit({ tripId }: { tripId: string }) {
  const outlet = useOutlet()
  if (!useTripExists(tripId)) return <NotFound />

  return (
    <div data-slot='split' className='grid min-h-0 flex-1 grid-cols-1 grid-rows-1'>
      <div className='flex min-h-0 min-w-0 flex-col'>
        {/* the title slot stays empty while the trip file loads; `Not found` is never the loading fallback */}
        <Suspense
          fallback={
            <>
              <PageHeader title='' backTo={routes.trips.list()} />
              <div className='min-h-0 flex-1 overflow-y-auto p-4'>
                <SkeletonRows />
              </div>
            </>
          }
        >
          <TripTimelineContent tripId={tripId} />
        </Suspense>
      </div>
      {outlet && (
        <div data-slot='detail-pane' className='@container fixed inset-0 flex min-h-0 min-w-0 flex-col border-border bg-background'>
          {outlet}
        </div>
      )}
    </div>
  )
}

function TripTimelineContent({ tripId }: { tripId: string }) {
  const trip = useTrip(tripId)
  const items = useTripItems(tripId)
  const [filter, setFilter] = useState<TripItemType | 'ALL'>('ALL')
  const chips = presentTripItemModules(items)
  // a filter whose last item went away is cleared, so the type coming back does not revive it
  if (filter !== 'ALL' && !chips.some((m) => m.type === filter)) setFilter('ALL')
  const activeFilter = filter !== 'ALL' && chips.some((m) => m.type === filter) ? filter : undefined
  const days = buildTimelineDays(toTimelineElements(items), activeFilter)
  const unknownItems = activeFilter ? [] : items.filter((i) => !getTripItemModule(i.type))
  const openItemId = useMatch(`${routes.trips.item(':tripId', ':itemId')}/*` as const)?.params.itemId
  useDocumentTitle(trip.name)

  const itemCount = `${items.length} ${items.length === 1 ? 'item' : 'items'}`

  return (
    <>
      <PageHeader title={trip.name} subtitle={`${formatTo.dateRange(trip.startDate, trip.endDate)} · ${itemCount}`} backTo={routes.trips.list()}>
        {chips.length > 0 && (
          <ChipRow
            aria-label='Filter'
            value={activeFilter ?? 'ALL'}
            onValueChange={setFilter}
            options={[{ value: 'ALL', label: 'All' }, ...chips.map((m) => ({ value: m.type, label: m.label }))]}
          />
        )}
      </PageHeader>
      <div className='relative min-h-0 flex-1'>
        <div className='h-full overflow-y-auto pb-20'>
          {days.length === 0 && unknownItems.length === 0 && <p className='p-4 text-muted-foreground'>Nothing planned yet</p>}
          {days.map((day) => (
            <section key={day.date.instant}>
              <TimelineDayHeader date={day.date} />
              <div className='py-1'>
                {day.elements.map((element) => (
                  <TimelineRow
                    key={element.id}
                    element={element}
                    to={routes.trips.item(tripId, element.tripItemId)}
                    selected={element.tripItemId === openItemId}
                  />
                ))}
              </div>
            </section>
          ))}
          {unknownItems.length > 0 && (
            <div className='border-t border-border py-1'>
              {unknownItems.map((item) => (
                <UnknownItemRow key={item.id} type={item.type} to={routes.trips.item(tripId, item.id)} selected={item.id === openItemId} />
              ))}
            </div>
          )}
        </div>
        <Link
          to={routes.trips.newItem(tripId)}
          aria-label='Add item'
          className='absolute right-4 bottom-4 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg transition-opacity duration-150 hover:opacity-90'
        >
          <Icon name='plus' className='size-[22px]' />
        </Link>
      </div>
    </>
  )
}

function NotFound() {
  return <PageHeader title='Not found' backTo={routes.trips.list()} />
}
