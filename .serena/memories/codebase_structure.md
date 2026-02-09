# Codebase Structure

```
reisenotiz/
├── src/
│   ├── main.tsx                    # App entry point
│   ├── index.css                   # Global styles, Tailwind config, CSS variables, theming
│   ├── routes.ts                   # React Router browser router definition
│   ├── vite-env.d.ts               # Vite type declarations
│   │
│   ├── components/
│   │   ├── layout/                 # AppLayout (main shell), Header, Navigation
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── button.tsx          # CVA-based with asChild pattern
│   │   │   ├── input.tsx           # Text input
│   │   │   ├── input-group.tsx     # Input with addon/prefix/suffix
│   │   │   ├── textarea.tsx        # Multiline text input
│   │   │   ├── field.tsx           # Form field wrapper
│   │   │   ├── label.tsx           # Form label
│   │   │   ├── tabs.tsx            # Base UI tabs wrapper
│   │   │   ├── switch.tsx          # Base UI switch
│   │   │   ├── separator.tsx       # Visual separator
│   │   │   ├── dialog.tsx          # Modal dialog
│   │   │   ├── confirm-dialog.tsx  # Confirmation dialog
│   │   │   ├── collapsible.tsx     # Collapsible/accordion section
│   │   │   ├── item.tsx            # List item component
│   │   │   ├── title.tsx           # Section/page title
│   │   │   ├── combobox/           # Combobox components
│   │   │   │   ├── base.tsx        # Base combobox component
│   │   │   │   └── airport.tsx     # Airport-specific combobox
│   │   │   └── timeline/           # Generic Timeline compound component
│   │   │       ├── timeline.tsx    # Core Timeline with sub-components
│   │   │       ├── timeline-layout.tsx  # Wrapper handling data mapping & animations
│   │   │       ├── types.ts        # TimelineElement interface
│   │   │       └── index.ts        # Barrel exports
│   │   ├── icon/                   # Icon wrapper around Lucide React
│   │   ├── trip-timeline/          # Trip-specific timeline (add-trip-item-fab)
│   │   ├── trip/                   # Trip-related components (trips list)
│   │   ├── trip-item/              # Trip item components
│   │   │   ├── trip-item-form.tsx  # Shared form for create/edit
│   │   │   ├── trip-item-view.tsx  # Read-only trip item view
│   │   │   ├── item-header.tsx     # Item header display
│   │   │   ├── collapsible-section.tsx
│   │   │   ├── date-range.tsx      # Date range display
│   │   │   ├── field-input.tsx     # Form field input
│   │   │   ├── field-textarea.tsx  # Form field textarea
│   │   │   ├── field-view.tsx      # Read-only field display
│   │   │   ├── field-passengers.tsx # Passengers field
│   │   │   ├── field-attachments.tsx # Attachments field
│   │   │   ├── field-array-list.tsx # Array/list field
│   │   │   ├── flight/             # Flight-specific components
│   │   │   │   ├── item-view.tsx   # Flight read-only view
│   │   │   │   ├── item-form.tsx   # Flight edit form
│   │   │   │   └── edit/
│   │   │   │       └── formSchema.ts # Flight form Zod schema
│   │   │   └── accommodation/      # Accommodation-specific components
│   │   │       └── item-view.tsx   # Accommodation read-only view
│   │   ├── records/                # User records management
│   │   │   ├── airport-records-list.tsx
│   │   │   └── airport-record-dialog.tsx
│   │   ├── base-combobox/          # (empty, may be deprecated)
│   │   └── theme-switcher.tsx      # Light/dark mode toggle
│   │
│   ├── pages/                      # Route page components
│   │   ├── home.tsx
│   │   ├── trips.tsx
│   │   ├── trip-timeline.tsx
│   │   ├── trip-item-view.tsx
│   │   ├── trip-item-create.tsx
│   │   ├── trip-item-edit.tsx
│   │   ├── settings.tsx
│   │   └── records/                # User records pages
│   │       ├── index.tsx           # Records landing page
│   │       └── airports.tsx        # Airport records page
│   │
│   ├── types/
│   │   ├── index.ts                # Re-exports
│   │   ├── common/                 # Common types (uuid)
│   │   └── trip/                   # Trip domain types
│   │       ├── trip.ts             # Trip type
│   │       ├── trip-item.ts        # TripItem base + TripItemType discriminator
│   │       ├── flight.ts           # Flight type
│   │       ├── hotel.ts            # Accommodation, AccommodationSite, HotelReservation
│   │       ├── person.ts           # Person type
│   │       ├── address.ts          # Address type
│   │       ├── attachment.ts       # Attachment type
│   │       └── index.ts            # Barrel exports
│   │
│   ├── store/
│   │   ├── index.ts                # Store exports
│   │   ├── trips-store.ts          # Zustand trips store
│   │   ├── selectors.ts            # Store selectors
│   │   └── user-records/           # User-managed records store
│   │       ├── airports.ts         # User airport records store
│   │       └── index.ts            # Barrel exports
│   │
│   ├── hooks/
│   │   ├── use-header-title.ts     # Hook for dynamic header titles
│   │   ├── use-theme.ts            # Theme (light/dark) hook
│   │   ├── use-form-field.ts       # Form field helper hook
│   │   ├── use-debounced-value.ts  # Debounce hook
│   │   └── use-airports.ts         # Airport data hook
│   │
│   ├── contexts/
│   │   └── header-context.tsx      # Header context provider
│   │
│   ├── lib/
│   │   ├── utils.ts                # cn() utility for class merging
│   │   ├── routes.ts               # Route path helper functions
│   │   ├── draft-items.ts          # Draft item utilities
│   │   ├── datetime/               # Custom DateTime class wrapping Luxon
│   │   │   ├── datetime.ts
│   │   │   ├── formatters.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── country-flag.ts     # Country flag emoji utility
│   │   └── validations/
│   │       ├── commons.ts          # Common validation schemas
│   │       └── user-airport.ts     # User airport validation schema
│   │
│   ├── services/
│   │   ├── index.ts                # Service exports
│   │   └── dictionaries/           # Dictionary service (airports, etc.)
│   │       ├── service.ts          # Dictionary class
│   │       ├── dicts.ts            # Dictionary instances
│   │       ├── types.ts            # Dictionary types
│   │       ├── parse-airports.ts   # Airport data parser
│   │       ├── data/               # Static dictionary data files
│   │       └── index.ts            # Barrel exports
│   │
│   └── stubs/                      # Mock/stub data for development
│       ├── trips.ts
│       ├── tripItems.ts
│       ├── airports.ts
│       └── timelineElements.ts
│
├── docs/
│   └── agents/
│       ├── DESIGN_SYSTEM.md        # Border radius, spacing, and design guidelines
│       └── CRUD_FLOW_BEST_PRACTISE.md  # Create/View/Edit flow patterns
│
├── public/                         # Static assets
├── docker/                         # Docker configuration
├── CLAUDE.md                       # Project instructions for Claude Code
├── package.json                    # Dependencies and scripts (pnpm)
├── components.json                 # UI component config
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.node.json              # TypeScript node config
├── vite.config.ts                  # Vite build configuration
├── eslint.config.ts                # ESLint flat config
├── .prettierrc                     # Prettier configuration
├── .editorconfig                   # Editor configuration
└── pwa-assets.config.ts            # PWA asset generation config
```

## Routes
- `/` — Home page
- `/trips` — Trips list
- `/trips/:tripId` — Trip timeline
- `/trips/:tripId/items/:itemId` — Trip item view
- `/trips/:tripId/items/new` — Create new trip item
- `/trips/:tripId/items/:itemId/edit` — Edit trip item
- `/settings` — Settings page
- `/records` — Records landing page
- `/records/airports` — Airport records management
