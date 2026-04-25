# Reisenotiz App UI Kit

Interactive click-through prototype of the Reisenotiz PWA.

## Screens covered
1. **Trips List** — home screen with trip cards + "New Trip" item
2. **Trip Timeline** — vertical timeline of flights/hotels for a trip
3. **Flight Detail** — view flight info with tabs for departure/arrival airports
4. **Hotel Detail** — accommodation view with check-in/out
5. **Create Trip Dialog** — modal for adding a new trip

## Usage
Open `index.html` — the prototype starts on the Trips screen. Click trip cards to navigate to the timeline, then click timeline items for detail views.

## Design notes
- Matches dark mode by default (as shown in screenshots)
- Mobile-first: 390px wide content area, bottom navigation
- Uses Lucide icons via CDN
- Inter font via Google Fonts
- All colors directly from `apps/frontend/src/index.css` OKLCH tokens
