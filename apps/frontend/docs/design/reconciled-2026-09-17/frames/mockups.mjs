// The drawing. Every frame in this folder is rendered from this file by `build.mjs`.
//
// Colours are Tailwind classes against `src/index.css`, never literal values, so the theme
// toggle flips every frame. A frame that does not flip cleanly has a hardcoded colour in it.
//
// This is a picture, not the app: nothing here is imported by `src/`, and every interactive
// element is a plain element. `SCREENS.md` says what each one is in the app.

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as lucide from 'lucide-react'

const icon = (name, size = 16, cls = '') =>
  renderToStaticMarkup(createElement(lucide[name], { size, strokeWidth: 2, className: `shrink-0 ${cls}` }))

// ─── Vocabulary ──────────────────────────────────────────────────────────────────────────────

const caps = 'font-mono text-[10px] tracking-[.08em] uppercase text-muted-foreground'
const capsLabel = (text, cls = '') => `<div class="${caps} ${cls}">${text}</div>`

const button = (label, kind = 'outline', cls = '') => {
  const kinds = {
    primary: 'bg-primary text-primary-foreground',
    outline: 'border border-input bg-background text-foreground',
    muted: 'bg-primary text-primary-foreground opacity-50',
  }
  return `<div class="inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] font-medium ${kinds[kind]} ${cls}">${label}</div>`
}

const iconButton = (name, size = 18) =>
  `<div class="grid size-9 shrink-0 place-items-center rounded-md text-foreground">${icon(name, size)}</div>`

const chip = (text, cls = 'text-muted-foreground') =>
  `<span class="inline-flex h-5 shrink-0 items-center whitespace-nowrap rounded-sm border border-border px-1.5 font-mono text-[10px] uppercase tracking-[.08em] ${cls}">${text}</span>`

const separator = '<div class="h-px shrink-0 bg-border"></div>'

// ─── Sync status ─────────────────────────────────────────────────────────────────────────────

// The label reserves the width of `LOCAL ONLY`, the longest state, so a change never shifts the
// header's actions (#34).
const syncBadge = `<div class="flex shrink-0 items-center gap-1.5 ${caps}">
  <span class="size-1.5 rounded-full bg-muted-foreground"></span><span class="w-[10.8ch]">Synced</span>
</div>`

// ─── Navigation ──────────────────────────────────────────────────────────────────────────────

const nav = [
  { key: 'home', label: 'Home', short: 'Home', icon: 'House' },
  { key: 'trips', label: 'Trips', short: 'Trips', icon: 'Luggage' },
  { key: 'places', label: 'Saved places', short: 'Places', icon: 'Bookmark' },
  { key: 'settings', label: 'Settings', short: 'Settings', icon: 'Settings' },
]

const tabBar = (active) => `<nav aria-label="Main" class="grid shrink-0 grid-cols-4 border-t border-border bg-card px-2 pt-1.5 pb-[22px]">
  ${nav.map((n) => `<div class="flex min-h-11 min-w-[52px] flex-col items-center justify-center gap-1 ${n.key === active ? 'text-brand' : 'text-muted-foreground'}">
    ${icon(n.icon, 20)}<span class="text-[10px] font-medium">${n.short}</span>
  </div>`).join('')}
</nav>`

const rail = (active, collapsed = false) => collapsed
  ? `<nav aria-label="Primary" class="flex w-16 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
  <div class="h-14"></div>
  <div class="flex flex-col items-center gap-0.5 px-2">
    ${nav.map((n) => `<div title="${n.label}" class="grid size-10 place-items-center rounded-md ${n.key === active ? 'bg-sidebar-accent text-sidebar-primary' : 'text-muted-foreground'}">${icon(n.icon, 20)}</div>`).join('')}
  </div>
  <div class="mt-auto flex flex-col items-center gap-2 pb-4">
    <div title="Expand" class="grid size-10 place-items-center rounded-md text-muted-foreground">${icon('PanelLeftOpen', 18)}</div>
    <div title="Synced" class="grid size-10 place-items-center"><span class="size-1.5 rounded-full bg-muted-foreground"></span></div>
  </div>
</nav>`
  : `<nav aria-label="Primary" class="flex w-[232px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
  <div class="flex h-14 items-center px-5 text-[15px] font-semibold text-sidebar-foreground">Reisenotiz</div>
  <div class="flex flex-col gap-0.5 px-2">
    ${nav.map((n) => `<div class="flex h-9 items-center gap-3 rounded-md px-3 text-[13px] font-medium ${n.key === active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground'}">
      <span class="${n.key === active ? 'text-sidebar-primary' : ''}">${icon(n.icon, 20)}</span>${n.label}
    </div>`).join('')}
  </div>
  <div class="mt-auto flex flex-col gap-1 px-2 pb-4">
    <div class="flex h-9 items-center gap-3 rounded-md px-3 text-[13px] font-medium text-muted-foreground">${icon('PanelLeftClose', 18)}Collapse</div>
    <div class="px-3 pt-2">${syncBadge}</div>
  </div>
</nav>`

// ─── PageHeader ──────────────────────────────────────────────────────────────────────────────

// `←`, type icon, title / subtitle, status (mobile only — the rail owns it above 900px),
// actions, then children (#49).
const pageHeader = ({ back, typeIcon, title, subtitle, actions = '', children = '', desktop = false, size = desktop ? 20 : 17 }) => `<header class="flex shrink-0 flex-col gap-3 border-b border-border ${desktop ? 'px-6 py-3.5' : 'px-4 py-2.5'}">
  <div class="flex min-h-9 min-w-0 items-center gap-1.5">
    ${back ? `<div class="-ml-2">${iconButton('ArrowLeft')}</div>` : ''}
    ${typeIcon ? `<span class="text-muted-foreground">${icon(typeIcon, 18)}</span>` : ''}
    <div class="min-w-0 flex-1 ${typeIcon ? 'pl-1' : ''}">
      <div class="truncate font-semibold leading-tight" style="font-size:${size}px">${title}</div>
      ${subtitle ? `<div class="truncate font-mono text-[11px] uppercase tracking-[.04em] text-muted-foreground">${subtitle}</div>` : ''}
    </div>
    ${desktop ? '' : syncBadge}
    ${actions}
  </div>
  ${children}
</header>`

// A region is header · scroller · optional footer, and only the scroller scrolls.
const region = ({ header, body, footer = '', fab = false, cls = '' }) => `<div class="relative flex min-h-0 min-w-0 flex-1 flex-col ${cls}">
  ${header}
  <div class="relative min-h-0 flex-1 overflow-hidden">
    <div class="h-full overflow-hidden">${body}</div>
    ${fab ? `<div class="absolute right-4 bottom-4 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">${icon('Plus', 22)}</div>` : ''}
  </div>
  ${footer}
</div>`

const mobile = (content, active) => `<div class="flex h-full flex-col bg-background text-foreground">
  ${content}
  ${active ? tabBar(active) : ''}
</div>`

const desktop = (content, active, collapsed = false) => `<div class="flex h-full bg-background text-foreground">
  ${rail(active, collapsed)}
  ${content}
</div>`

// ─── Sample data ─────────────────────────────────────────────────────────────────────────────

const trip = { name: 'Alps to the Adriatic', range: '5 – 16 Sep 2026', days: 12, items: 5 }

// ─── Home ────────────────────────────────────────────────────────────────────────────────────

const homeCard = ({ eyebrow, count, caption, big }) => `<div class="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
  ${capsLabel(eyebrow, '!text-brand')}
  <div class="line-clamp-2 min-w-0 font-semibold leading-[1.15] tracking-[-.01em]" style="font-size:${big ? 38 : 27}px">${trip.name}</div>
  <div class="font-mono text-[11px] uppercase tracking-[.04em] text-muted-foreground">${trip.range} · ${trip.days} days · ${trip.items} items</div>
  ${separator}
  <div class="flex flex-col gap-1">
    <div class="text-[36px] font-semibold leading-none tabular-nums text-brand">${count}</div>
    ${capsLabel(caption)}
  </div>
  ${button('Open timeline', 'primary', big ? 'self-start' : 'w-full')}
</div>`

const stat = (value, label, big) => `<div class="flex flex-col gap-1 rounded-xl border border-border bg-card p-3">
  <div class="font-semibold leading-none tabular-nums" style="font-size:${big ? 30 : 26}px">${value}</div>
  ${capsLabel(label)}
</div>`

const nightsPerYear = [[2021, 18], [2022, 31], [2023, 44], [2024, 27], [2025, 38], [2026, 29]]
const moved = [['Flight', 46, 'bg-chart-2'], ['Train', 31, 'bg-chart-3'], ['Car', 15, 'bg-chart-4'], ['Ferry, bus', 8, 'bg-chart-5']]

const allTime = (big) => `<section class="flex flex-col gap-3">
  <div class="flex items-baseline justify-between">
    <h2 class="text-[15px] font-semibold">All time</h2>${capsLabel('Since 2019')}
  </div>
  <div class="grid grid-cols-2 gap-2">
    ${stat(14, 'Countries', big)}${stat(132, 'Nights away', big)}${stat(41, 'Trips', big)}${stat(68, 'Flights', big)}
  </div>
  <div class="flex flex-col gap-3 rounded-xl border border-border bg-card p-3">
    ${capsLabel('Nights per year')}
    <div class="flex items-end gap-2" style="height:${big ? 90 : 46}px">
      ${nightsPerYear.map(([y, n]) => `<div class="flex-1 rounded-sm ${y === 2026 ? 'bg-chart-2' : 'bg-muted'}" style="height:${Math.round((n / 44) * 100)}%"></div>`).join('')}
    </div>
    <div class="flex gap-2">
      ${nightsPerYear.map(([y]) => `<div class="flex-1 text-center font-mono text-[10px] text-muted-foreground">${big ? y : `’${String(y).slice(2)}`}</div>`).join('')}
    </div>
  </div>
  <div class="flex flex-col gap-3 rounded-xl border border-border bg-card p-3">
    ${capsLabel('How you moved')}
    <div class="flex h-2 gap-0.5 overflow-hidden rounded-sm">
      ${moved.map(([, p, c]) => `<div class="${c}" style="width:${p}%"></div>`).join('')}
    </div>
    <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
      ${moved.map(([l, p, c]) => `<div class="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.04em]"><span class="size-2 rounded-sm ${c}"></span><span class="flex-1 text-muted-foreground">${l}</span><span class="tabular-nums">${p}%</span></div>`).join('')}
    </div>
  </div>
  <div class="flex flex-col gap-1 rounded-xl border border-border bg-card p-3">
    ${capsLabel('Longest trip')}
    <div class="text-[15px] font-semibold">Japan in autumn</div>
    <div class="font-mono text-[11px] uppercase tracking-[.04em] text-muted-foreground">23 nights · Oct 2025</div>
  </div>
</section>`

const homeMobile = () => mobile(region({
  header: pageHeader({ title: 'Reisenotiz' }),
  body: `<div class="flex flex-col gap-6 p-4">
    ${homeCard({ eyebrow: 'Upcoming trip', count: 7, caption: 'Days to go' })}
    ${allTime(false)}
  </div>`,
}), 'home')

const homeDesktop = (collapsed) => desktop(region({
  header: pageHeader({ title: 'Overview', desktop: true }),
  body: `<div class="grid grid-cols-[1fr_400px] items-start gap-6 p-6">
    ${homeCard({ eyebrow: 'Ongoing trip', count: 9, caption: 'Of 12 days', big: true })}
    ${allTime(true)}
  </div>`,
}), 'home', collapsed)

// ─── Trip list ───────────────────────────────────────────────────────────────────────────────

const groups = [
  { label: 'Ongoing', rows: [{ d: '05', m: 'Sep', name: trip.name, items: trip.items, when: 'Day 9 of 12', hl: true }] },
  { label: 'Upcoming', count: 1, rows: [{ d: '16', m: 'Oct', name: 'Lisbon and the Alentejo coast', items: 6, when: 'In 1 month' }] },
  { label: '2026', count: 2, rows: [
    { d: '03', m: 'Apr', name: 'Seville, Córdoba and Granada', items: 9 },
    { d: '20', m: 'Feb', name: 'Copenhagen long weekend', items: 3 },
  ] },
  { label: '2025', count: 2, rows: [
    { d: '18', m: 'Oct', name: 'Japan in autumn: Tokyo, Kanazawa, the Kiso valley and three days in Kyoto', items: 14 },
    { d: '07', m: 'Mar', name: 'Vienna', items: 2 },
  ] },
]

const tripRow = (r, px) => `<div class="flex min-w-0 items-start gap-3 border-b border-border py-3 ${px} ${r.hl ? 'border-l-2 border-l-brand bg-accent' : ''}">
  <div class="flex w-[38px] shrink-0 flex-col items-center pt-0.5">
    <div class="font-mono text-[16px] leading-tight">${r.d}</div>
    <div class="font-mono text-[10px] uppercase text-muted-foreground">${r.m}</div>
  </div>
  <div class="line-clamp-2 min-w-0 flex-1 text-[17px] font-semibold leading-snug">${r.name}</div>
  <div class="flex shrink-0 flex-col items-end gap-1 pt-0.5">
    ${chip(`${r.items} items`)}
    ${r.when ? chip(r.when, 'text-brand') : ''}
  </div>
  <div class="-my-1 -mr-2 grid size-8 shrink-0 place-items-center text-muted-foreground">${icon('Ellipsis')}</div>
</div>`

const tripList = (px) => groups.map((g) => `<section>
  <div class="flex items-center gap-2 ${px} pt-5 pb-2 ${caps}">${g.label}${g.count ? `<span class="text-foreground">${g.count}</span>` : ''}</div>
  ${g.rows.map((r) => tripRow(r, px)).join('')}
</section>`).join('')

const tripListMobile = () => mobile(region({
  header: pageHeader({ title: 'Trips' }),
  body: tripList('px-4'),
  fab: true,
}), 'trips')

const tripListDesktop = () => desktop(region({
  header: pageHeader({ title: 'Trips', desktop: true }),
  body: tripList('px-6'),
  fab: true,
}), 'trips')

// ─── Trip timeline ───────────────────────────────────────────────────────────────────────────

// Day buckets are local dates in the trip's origin zone. Every element is one row; a flight and a
// stay are two each (#29). Summaries carry the role and the place, never a duration (#42).
const days = [
  { day: 'Sat, 05 Sep', rows: [
    { t: '08:40', icon: 'Plane', title: 'LH 1953', sum: 'Departure · BER T1 · Seat 14A', item: 'lh1953' },
    { t: '10:00', icon: 'Plane', title: 'LH 1953', sum: 'Arrival · MUC T2', item: 'lh1953' },
    { t: '16:40', icon: 'Bed', title: 'Hotel Weisses Kreuz', sum: 'Check-in · Herzog-Friedrich-Straße 31' },
  ] },
  { day: 'Tue, 08 Sep', rows: [
    { t: '10:30', icon: 'Bed', title: 'Hotel Weisses Kreuz', sum: 'Check-out · Herzog-Friedrich-Straße 31' },
  ] },
  { day: 'Wed, 09 Sep', rows: [
    { t: '13:30', icon: 'Bed', title: 'Vander Urbani Resort', sum: 'Check-in · Krojaška ulica 6' },
  ] },
  { day: 'Sat, 12 Sep', rows: [
    { t: '11:00', icon: 'Bed', title: 'Vander Urbani Resort', sum: 'Check-out · Krojaška ulica 6' },
    { t: '15:00', icon: 'Bed', title: 'Hotel Flora', sum: 'Check-in · Calle Larga XXII Marzo 2283' },
  ] },
  { day: 'Wed, 16 Sep', rows: [
    { t: '10:00', icon: 'Bed', title: 'Hotel Flora', sum: 'Check-out · Calle Larga XXII Marzo 2283' },
    { t: '17:05', icon: 'Plane', title: 'U2 5236', sum: 'Departure · VCE · Seat 3C' },
    { t: '18:45', icon: 'Plane', title: 'U2 5236', sum: 'Arrival · BER T1' },
  ] },
]

const chips = `<div class="-mx-4 flex gap-1.5 overflow-hidden px-4">
  <span class="inline-flex h-7 shrink-0 items-center rounded-sm border border-input bg-accent px-2.5 font-mono text-[10px] uppercase tracking-[.08em] text-accent-foreground">All</span>
  <span class="inline-flex h-7 shrink-0 items-center rounded-sm border border-border px-2.5 font-mono text-[10px] uppercase tracking-[.08em] text-muted-foreground">Flight</span>
  <span class="inline-flex h-7 shrink-0 items-center rounded-sm border border-border px-2.5 font-mono text-[10px] uppercase tracking-[.08em] text-muted-foreground">Accommodation</span>
</div>`

const timelineRow = (r, { timeCol, px, selected }) => {
  const on = selected && r.item === selected
  return `<div class="flex min-h-11 min-w-0 items-stretch gap-3 ${px} ${on ? 'border-l-2 border-l-brand bg-accent' : ''}">
  <div class="shrink-0 py-2.5 text-right" style="width:${timeCol}px">
    <div class="font-mono text-[13px] leading-5">${r.t}</div>
    ${r.prefix ? `<div class="font-mono text-[10px] uppercase text-destructive">${r.prefix}</div>` : ''}
  </div>
  <div class="w-px shrink-0 bg-border"></div>
  <div class="flex min-w-0 flex-1 items-start gap-2.5 py-2.5">
    <span class="mt-0.5 ${on ? 'text-brand' : 'text-muted-foreground'}">${icon(r.icon)}</span>
    <div class="min-w-0 flex-1">
      <div class="truncate text-[14px] font-medium leading-5">${r.title}</div>
      <div class="truncate font-mono text-[11px] uppercase tracking-[.04em] text-muted-foreground">${r.sum}</div>
    </div>
  </div>
</div>`
}

const timeline = (opts) => days.map((d) => `<section>
  <div class="border-y border-border bg-card py-2 ${opts.px} text-[13px] font-medium">${d.day}</div>
  <div class="py-1">${d.rows.map((r) => timelineRow(r, opts)).join('')}</div>
</section>`).join('')

const timelineHeader = (desktopHeader) => pageHeader({
  back: true,
  title: trip.name,
  subtitle: `${trip.range} · ${trip.items} items`,
  children: chips,
  desktop: desktopHeader,
})

const timelineMobile = () => mobile(region({
  header: timelineHeader(false),
  body: timeline({ timeCol: 44, px: 'px-4' }),
  fab: true,
}), 'trips')

// ─── Item views ──────────────────────────────────────────────────────────────────────────────

const fact = (label, value) => `<div class="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-0">
  <div class="font-mono text-[11px] uppercase tracking-[.04em] text-muted-foreground">${label}</div>
  <div class="min-w-0 text-right font-mono text-[12px] [overflow-wrap:anywhere]">${value}</div>
</div>`

const personChips = (names) => `<div class="flex flex-wrap justify-end gap-1">${names.map((n) => `<span class="rounded-sm bg-muted px-1.5 py-0.5 font-sans text-[12px]">${n}</span>`).join('')}</div>`

const addressBlock = (label, name, address, extra = '') => `<div class="flex flex-col gap-1">
  ${capsLabel(label)}
  <div class="text-[14px] font-medium">${name}</div>
  <div class="text-[13px] text-brand underline decoration-brand/40 underline-offset-2">${address}</div>
  ${extra}
</div>`

const notes = (text) => `<div class="flex flex-col gap-1">
  ${capsLabel('Notes')}
  <p class="text-[13px] leading-[1.6] [overflow-wrap:anywhere]">${text}</p>
</div>`

const attachments = (names) => `<div class="flex flex-col gap-1.5">
  ${capsLabel('Attachments')}
  <div class="flex flex-wrap gap-1.5">${names.map((n) => `<span class="inline-flex h-7 items-center gap-1.5 rounded-sm border border-border px-2 text-[12px]"><span class="text-muted-foreground">${icon('Paperclip', 14)}</span>${n}</span>`).join('')}</div>
</div>`

const viewHeader = (typeIcon, title, desktopPane) => pageHeader({
  back: true,
  typeIcon,
  title,
  actions: iconButton('Ellipsis'),
  desktop: desktopPane,
  size: desktopPane ? 15 : 17,
})

const editFooter = `<div class="shrink-0 border-t border-border bg-background px-4 pt-3 pb-[22px]">${button('Edit', 'outline', 'w-full')}</div>`

const heroEnd = (code, time, where, align) => `<div class="flex flex-col gap-0.5 ${align}">
  <div class="font-mono text-[26px] font-semibold leading-none">${code}</div>
  <div class="font-mono text-[10px] text-muted-foreground">UTC+2</div>
  <div class="mt-1 font-mono text-[18px] leading-tight">${time}</div>
  <div class="font-mono text-[11px] uppercase text-muted-foreground">${where}</div>
</div>`

const flightBody = `<div class="flex flex-col gap-5 p-4">
  <div class="flex flex-col gap-1">
    <div class="text-[26px] font-semibold leading-tight">LH 1953</div>
    <div class="font-mono text-[11px] uppercase tracking-[.04em] text-muted-foreground">Lufthansa · Sat, 05 Sep</div>
  </div>
  <div class="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
    ${heroEnd('BER', '08:40', 'T1 · Gate A14', 'items-start')}
    <div class="flex flex-col items-center gap-1 pt-2">
      <div class="font-mono text-[10px] text-muted-foreground">1h 20m</div>
      <div class="h-px w-16 bg-border"></div>
    </div>
    ${heroEnd('MUC', '10:00', 'T2', 'items-end text-right')}
  </div>
  <div class="flex flex-col">
    ${fact('Booking code', '6XK2PQ')}
    ${fact('Seat', '14A')}
    ${fact('Passengers', personChips(['Anna Weber', 'Jonas Weber']))}
  </div>
  ${addressBlock('Departure airport', 'Berlin Brandenburg', 'Melli-Beese-Ring 1, 12529 Schönefeld')}
  ${addressBlock('Arrival airport', 'Munich Airport', 'Nordallee 25, 85356 München')}
  ${notes('Checked in online. Bag drop opens at 06:40 in T1, row C. Train to Innsbruck leaves MUC at 11:55.')}
  ${attachments(['Boarding pass', 'Booking confirmation'])}
</div>`

const stayHero = (planned) => `<div class="flex flex-col rounded-xl border border-border bg-card p-4">
  <div class="flex items-center justify-between gap-3">
    <div class="flex flex-col gap-0.5">
      ${capsLabel('Check-in')}
      <div class="font-mono text-[13px] uppercase">Sat, 05 Sep</div>
      <div class="font-mono text-[11px] uppercase text-muted-foreground">From 14:00</div>
    </div>
    <div class="flex flex-col items-center">
      <div class="text-[20px] font-semibold leading-none tabular-nums text-brand">3</div>
      ${capsLabel('Nights')}
    </div>
    <div class="flex flex-col items-end gap-0.5 text-right">
      ${capsLabel('Check-out')}
      <div class="font-mono text-[13px] uppercase">Tue, 08 Sep</div>
      <div class="font-mono text-[11px] uppercase text-muted-foreground">By 11:00</div>
    </div>
  </div>
  ${planned ? `<div class="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3 font-mono text-[11px] uppercase text-brand">
    <div class="flex flex-col gap-0.5"><span class="${caps}">You arrive</span>5 Sep · 16:40</div>
    <div class="flex flex-col items-end gap-0.5"><span class="${caps}">You leave</span>8 Sep · 10:30</div>
  </div>` : ''}
</div>`

const stayBody = (planned) => `<div class="flex flex-col gap-5 p-4">
  <div class="flex flex-col gap-1">
    <div class="text-[26px] font-semibold leading-tight">Hotel Weisses Kreuz</div>
    <div class="font-mono text-[11px] uppercase tracking-[.04em] text-muted-foreground">Innsbruck, Austria · UTC+2</div>
  </div>
  ${stayHero(planned)}
  <div class="flex flex-col">
    ${fact('Guests', personChips(['Anna Weber', 'Jonas Weber']))}
    ${fact('Rooms', '1')}
    ${fact('Reserved by', 'Anna Weber')}
  </div>
  ${addressBlock('Address', 'Hotel Weisses Kreuz', 'Herzog-Friedrich-Straße 31, 6020 Innsbruck', '<div class="font-mono text-[12px] text-muted-foreground">+43 512 59479</div>')}
  ${notes('Booking ref. 4417 2290 1. Free cancellation until 3 Sep. Parking in the Altstadt garage, five minutes on foot. Breakfast 07:00–10:30.')}
  ${attachments(['Booking.pdf'])}
</div>`

const flightView = () => mobile(region({ header: viewHeader('Plane', 'Flight'), body: flightBody, footer: editFooter }))
const stayView = (planned) => mobile(region({ header: viewHeader('Bed', 'Stay'), body: stayBody(planned), footer: editFooter }))

// ─── Type picker ─────────────────────────────────────────────────────────────────────────────

const typePicker = () => mobile(region({
  header: pageHeader({ back: true, title: 'Add item' }),
  body: `<div class="grid grid-cols-2 gap-3 p-4">
    ${[['Plane', 'Flight'], ['Bed', 'Stay']].map(([i, l]) => `<div class="flex min-h-24 flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4">
      <span class="text-muted-foreground">${icon(i, 20)}</span><span class="text-[15px] font-medium">${l}</span>
    </div>`).join('')}
  </div>`,
}))

// ─── Forms ───────────────────────────────────────────────────────────────────────────────────

const input = (value, { placeholder, mono } = {}) => `<div class="flex h-9 min-w-0 items-center rounded-md border border-input bg-background px-2.5 text-[13px] ${mono ? 'font-mono' : ''}">
  ${value ? `<span class="truncate">${value}</span>` : `<span class="truncate text-muted-foreground">${placeholder ?? ''}</span>`}
</div>`

const field = (label, control, span = '') => `<div class="flex min-w-0 flex-col gap-1.5 ${span}">${capsLabel(label)}${control}</div>`

const group = (label, note = '') => `<div class="flex flex-col gap-2 pt-3">
  <div class="flex items-baseline justify-between gap-3">${capsLabel(label, '!text-foreground')}${note}</div>
  ${separator}
</div>`

const placePicker = (label, value, line1, line2) => `<div class="flex flex-col gap-1.5">
  ${capsLabel(label)}
  <div class="flex gap-2">
    <div class="flex h-9 min-w-0 flex-1 items-center justify-between rounded-md border border-input bg-background px-2.5 text-[13px]">
      <span class="truncate">${value}</span><span class="text-muted-foreground">${icon('ChevronDown')}</span>
    </div>
    ${button('Edit')}
  </div>
  <div class="flex flex-col px-0.5">
    <div class="truncate text-[12px]">${line1}</div>
    <div class="truncate font-mono text-[11px] text-muted-foreground">${line2}</div>
  </div>
</div>`

const personField = (label, names) => field(label, `<div class="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-1.5 py-1">
  ${names.map((n) => `<span class="inline-flex h-6 items-center gap-1 rounded-sm bg-muted pr-1 pl-1.5 text-[12px]">${n}<span class="text-muted-foreground">${icon('X', 12)}</span></span>`).join('')}
  <span class="px-1 text-[13px] text-muted-foreground">Add a person</span>
</div>`)

const attachField = (names) => field('Attachments', `<div class="flex flex-wrap gap-1.5">
  ${names.map((n) => `<span class="inline-flex h-7 items-center gap-1.5 rounded-sm border border-border px-2 text-[12px]"><span class="text-muted-foreground">${icon('Paperclip', 14)}</span>${n}<span class="text-muted-foreground">${icon('X', 12)}</span></span>`).join('')}
  ${button(`${icon('Plus', 14)}Attach`, 'outline', '!h-7 !px-2 !text-[12px]')}
</div>`)

const textarea = (text) => `<div class="min-h-20 rounded-md border border-input bg-background px-2.5 py-2 text-[13px] leading-[1.6]">${text}</div>`

const formFooter = `<div class="flex shrink-0 gap-2 border-t border-border bg-background px-4 pt-3 pb-[22px]">
  ${button('Cancel', 'outline', 'flex-1')}${button('Save', 'muted', 'flex-1')}
</div>`

const flightForm = () => mobile(region({
  header: pageHeader({ back: true, typeIcon: 'Plane', title: 'Edit flight' }),
  body: `<div class="flex flex-col gap-3 p-4">
    <div class="grid grid-cols-2 gap-3">
      ${field('Flight number', input('LH 1953', { mono: true }))}
      ${field('Carrier', input('Lufthansa'))}
    </div>
    ${group('Departure')}
    ${placePicker('Airport', 'BER', 'Berlin Brandenburg · BER', 'Melli-Beese-Ring 1, Schönefeld · Europe/Berlin')}
    <div class="grid grid-cols-2 gap-3">${field('Date', input('2026-09-05', { mono: true }))}${field('Time', input('08:40', { mono: true }))}</div>
    <div class="grid grid-cols-2 gap-3">${field('Terminal', input('T1'))}${field('Gate', input('A14'))}</div>
    ${group('Arrival')}
    ${placePicker('Airport', 'MUC', 'Munich Airport · MUC', 'Nordallee 25, München · Europe/Berlin')}
    <div class="grid grid-cols-2 gap-3">${field('Date', input('2026-09-05', { mono: true }))}${field('Time', input('10:00', { mono: true }))}</div>
    <div class="grid grid-cols-2 gap-3">${field('Terminal', input('T2'))}${field('Gate', input('', { placeholder: 'Gate' }))}</div>
    <div class="grid grid-cols-2 gap-3 pt-3">
      ${field('Booking code', input('6XK2PQ', { mono: true }))}
      ${field('Seat', input('14A', { mono: true }))}
    </div>
    ${personField('Passengers', ['Anna Weber', 'Jonas Weber'])}
    ${field('Notes', textarea('Checked in online. Bag drop opens at 06:40 in T1, row C.'))}
    ${attachField(['Boarding pass', 'Booking confirmation'])}
  </div>`,
  footer: formFooter,
}))

const stayForm = () => mobile(region({
  header: pageHeader({ back: true, typeIcon: 'Bed', title: 'Edit stay' }),
  body: `<div class="flex flex-col gap-3 p-4">
    ${placePicker('Property', 'Vander Urbani Resort', 'Vander Urbani Resort · Hotel', 'Krojaška ulica 6, Ljubljana · Europe/Ljubljana')}
    <div class="grid grid-cols-2 gap-3">${field('Check-in', input('2026-09-08', { mono: true }))}${field('From', input('14:00', { mono: true }))}</div>
    <div class="grid grid-cols-2 gap-3">${field('Check-out', input('2026-09-12', { mono: true }))}${field('By', input('11:00', { mono: true }))}</div>
    ${group('Plan', `<div class="font-mono text-[10px] uppercase tracking-[.08em] text-brand">Arriving 9 Sep · 1 paid night unused</div>`)}
    <div class="grid grid-cols-2 gap-3">${field('You arrive', input('2026-09-09', { mono: true }))}${field('At', input('13:30', { mono: true }))}</div>
    <div class="grid grid-cols-2 gap-3">${field('You leave', input('2026-09-12', { mono: true }))}${field('At', input('11:00', { mono: true }))}</div>
    <div class="pt-3">${personField('Guests', ['Anna Weber', 'Jonas Weber'])}</div>
    <div class="grid grid-cols-2 gap-3">${field('Rooms', input('1', { mono: true }))}${field('Reserved by', input('Anna Weber'))}</div>
    ${field('Notes', textarea('Late check-in arranged by email. Code for the side door comes the day before.'))}
    ${attachField(['Booking.pdf'])}
  </div>`,
  footer: formFooter,
}))

// ─── Trip timeline, desktop ──────────────────────────────────────────────────────────────────

const timelineDesktop = () => desktop(`<div class="grid min-w-0 flex-1 grid-cols-[1.35fr_400px]">
  ${region({
    header: timelineHeader(true),
    body: timeline({ timeCol: 52, px: 'px-6', selected: 'lh1953' }),
    fab: true,
  })}
  ${region({ header: viewHeader('Plane', 'Flight', true), body: flightBody, footer: editFooter.replace('pb-[22px]', 'pb-3'), cls: 'border-l border-border' })}
</div>`, 'trips')

// ─── The frames ──────────────────────────────────────────────────────────────────────────────

const M = { w: 390, h: 844 }
const D = { w: 1440, h: 900 }

export const frames = [
  { file: '01-home-mobile', title: 'Home', size: M, now: 'Sat 29 Aug 2026', note: 'Upcoming trip, seven days out.', html: homeMobile() },
  { file: '02-trip-list-mobile', title: 'Trip list', size: M, now: 'Sun 13 Sep 2026', note: 'The ongoing trip is the one home picks, so it carries the highlight.', html: tripListMobile() },
  { file: '03-trip-timeline-mobile', title: 'Trip timeline', size: M, note: 'Every flight and stay is two rows. No row shows an end time.', html: timelineMobile() },
  { file: '05-flight-view', title: 'Flight view', size: M, note: 'Full-screen layer over the timeline, so no tab bar.', html: flightView() },
  { file: '06-stay-view', title: 'Stay view', size: M, note: 'With a planned interval.', html: stayView(true) },
  { file: '06-stay-view-no-plan', title: 'Stay view, no plan', size: M, note: 'No planned interval: the planned row and its rule are gone, not empty.', html: stayView(false) },
  { file: '13-type-picker', title: 'Type picker', size: M, note: 'Two types exist, so two tiles. No PDF drop target.', html: typePicker() },
  { file: '14-flight-form', title: 'Flight form', size: M, note: 'Editing, untouched — so Save is muted.', html: flightForm() },
  { file: '15-stay-form', title: 'Stay form', size: M, note: 'Planned arrival a day after check-in, so the unused-night note shows.', html: stayForm() },
  { file: '22-home-desktop', title: 'Home', size: D, now: 'Sun 13 Sep 2026', note: 'Ongoing trip, day nine.', html: homeDesktop(false) },
  { file: '22-home-desktop-rail-collapsed', title: 'Home, rail collapsed', size: D, now: 'Sun 13 Sep 2026', note: 'The rail at 64px: icons, the toggle, the sync dot.', html: homeDesktop(true) },
  { file: '23-trip-timeline-desktop', title: 'Trip timeline', size: D, note: 'LH 1953 open in the pane; both of its rows are selected.', html: timelineDesktop() },
  { file: '24-trip-list-desktop', title: 'Trip list', size: D, now: 'Sun 13 Sep 2026', note: 'Frame 02’s rows at full width. No table.', html: tripListDesktop() },
]
