import { Skeleton } from '@/components/ui/skeleton'

// The app's only loading visual. Held invisible for 200ms so a warm load, which never waits,
// never flickers.
export function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className='flex animate-in flex-col gap-2 fade-in delay-200 fill-mode-backwards' aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className='h-12 animate-none' />
      ))}
    </div>
  )
}
