// A drawing of the statistics a future service will compute: every value is a literal, nothing is
// counted. Delete the whole file when that service exists.

const stats = [
  ['14', 'Countries'],
  ['132', 'Nights away'],
  ['41', 'Trips'],
  ['68', 'Flights'],
]

const nightsPerYear = [
  ['2021', 40],
  ['2022', 70],
  ['2023', 100],
  ['2024', 61],
  ['2025', 86],
  ['2026', 66],
] as const

const moves = [
  ['Flight', 46, 'bg-chart-2'],
  ['Train', 31, 'bg-chart-3'],
  ['Car', 15, 'bg-chart-4'],
  ['Ferry, bus', 8, 'bg-chart-5'],
] as const

const capsLabel = 'font-mono text-[10px] tracking-[.08em] uppercase'
const caption = `${capsLabel} text-muted-foreground`
const panel = 'rounded-xl border border-border bg-card p-4'

export function AllTimeStatsMockup() {
  return (
    <section className='flex min-w-0 flex-col gap-3'>
      <div className='flex items-baseline justify-between pt-1'>
        <h2 className='text-[17px] font-semibold'>All time</h2>
        <span className={caption}>Since 2019</span>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        {stats.map(([value, label]) => (
          <div key={label} className={panel}>
            <div data-slot='home-stat-value' className='text-[26px] leading-tight font-semibold tabular-nums'>{value}</div>
            <div className={caption}>{label}</div>
          </div>
        ))}
      </div>

      <div className={panel}>
        <div className={caption}>Nights per year</div>
        <div data-slot='home-bars' className='mt-4 flex h-[46px] items-end gap-2'>
          {nightsPerYear.map(([year, height], i) => (
            <div
              key={year}
              className={i === nightsPerYear.length - 1 ? 'flex-1 rounded-sm bg-chart-2' : 'flex-1 rounded-sm bg-muted'}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className='mt-2 flex gap-2'>
          {nightsPerYear.map(([year]) => (
            <div key={year} className='flex-1 text-center font-mono text-[10px] text-muted-foreground'>
              <span data-shell='mobile'>’{year.slice(2)}</span>
              <span data-shell='desktop'>{year}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={panel}>
        <div className={caption}>How you moved</div>
        <div className='mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full'>
          {moves.map(([label, share, colour]) => (
            <div key={label} className={colour} style={{ width: `${share}%` }} />
          ))}
        </div>
        <div className='mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5'>
          {moves.map(([label, share, colour]) => (
            <div key={label} className={`flex items-center gap-2 ${capsLabel}`}>
              <span className={`size-2 shrink-0 rounded-full ${colour}`} />
              <span className='flex-1 text-muted-foreground'>{label}</span>
              <span className='tabular-nums'>{share}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className={panel}>
        <div className={caption}>Longest trip</div>
        <div className='mt-1 font-semibold'>Japan in autumn</div>
        <div className={`mt-1 ${caption}`}>23 nights · Oct 2025</div>
      </div>
    </section>
  )
}
