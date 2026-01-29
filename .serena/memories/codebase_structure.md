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
│   │   ├── layout/                 # AppLayout (main shell with header context)
│   │   ├── ui/                     # Reusable UI components (Button, Input, Dialog, Tabs, etc.)
│   │   ├── icon/                   # Icon wrapper around Lucide React
│   │   ├── timeline/               # Generic Timeline compound component
│   │   ├── trip-timeline/          # Trip-specific timeline components
│   │   ├── trip/                   # Trip-related components
│   │   ├── trip-item/              # Trip item components
│   │   └── theme-switcher.tsx      # Light/dark mode toggle
│   │
│   ├── pages/                      # Route page components
│   │   ├── home.tsx
│   │   ├── trips.tsx
│   │   ├── trip-timeline.tsx
│   │   ├── trip-item-view.tsx
│   │   ├── trip-item-create.tsx
│   │   ├── trip-item-edit.tsx
│   │   └── settings.tsx
│   │
│   ├── types/
│   │   ├── index.ts                # Re-exports
│   │   ├── common/                 # Common/shared types
│   │   └── trip/                   # Trip domain types (Trip, TripItem, Flight, etc.)
│   │
│   ├── store/
│   │   ├── index.ts                # Store exports
│   │   ├── trips-store.ts          # Zustand trips store
│   │   └── selectors.ts            # Store selectors
│   │
│   ├── state/
│   │   └── records/                # State record types
│   │
│   ├── hooks/
│   │   ├── use-header-title.ts     # Hook for dynamic header titles
│   │   ├── use-theme.ts            # Theme (light/dark) hook
│   │   ├── use-form-field.ts       # Form field helper hook
│   │   └── use-debounced-value.ts  # Debounce hook
│   │
│   ├── contexts/
│   │   └── header-context.tsx      # Header context provider
│   │
│   ├── lib/
│   │   ├── utils.ts                # cn() utility for class merging
│   │   ├── routes.ts               # Route path helper functions
│   │   ├── draft-items.ts          # Draft item utilities
│   │   ├── datetime/               # Custom DateTime class wrapping Luxon
│   │   ├── utils/                  # Additional utilities
│   │   └── validations/            # Zod validation schemas
│   │
│   ├── services/
│   │   ├── index.ts                # Service exports
│   │   └── dictionaries/           # Dictionary service (airports, etc.)
│   │
│   └── stubs/                      # Mock/stub data for development
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
├── tsconfig.json                   # TypeScript configuration
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
