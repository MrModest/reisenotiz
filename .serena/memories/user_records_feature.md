# User Records Feature

## Overview
User-created dictionary records (starting with airports). Users can manage custom airport records
that override dictionary entries in selectors without mutating static data.

## Architecture
- **Store**: `src/store/user-records/airports.ts` - Zustand store with CRUD, persisted to `reisenotiz-user-airports` in localStorage
- **Merge Hook**: `src/hooks/use-airports.ts` - `useAirports()` merges dict + user airports, user overrides dict by IATA code
- **Validation**: `src/lib/validations/user-airport.ts` - Zod schema reusing `addressSchema` and `timezoneSchema`
- **Pages**: `/records` (index) and `/records/airports` (list with dialog for add/edit)
- **Components**: `src/components/records/airport-records-list.tsx` and `airport-record-dialog.tsx`

## Key Patterns
- Dialog uses `useWatch` (not `form.watch`) for React Compiler compatibility
- Store keyed by IATA code (natural identifier, enables simple merge)
- `updateAirport(oldCode, newAirport)` handles code changes by removing old key
- "Save to my records" button in flight form's `AirportPoint` component
- Dictionary override notice shown when creating airport with code matching dict entry

## Consumers Updated
- `src/components/trip-item/flight/item-form.tsx` - uses `useAirports()` hook
- `src/pages/home.tsx` - uses `useAirports()` hook
- `src/pages/settings.tsx` - link to /records

## Dictionary Cleanup
- Removed `add()` method and FIXME comment from `Dictionary` class
- Removed unused `fetchedAt` field
