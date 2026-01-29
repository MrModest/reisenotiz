# Project Overview: Reisenotiz

## Purpose
Reisenotiz is a travel notes/trip planning Progressive Web App (PWA). It allows users to manage trips with timeline items such as flights, accommodations, and other travel-related entries.

## Tech Stack
- **Language**: TypeScript (strict mode)
- **Framework**: React 19 with Vite 7
- **Routing**: React Router v7 (browser router, nested routes)
- **Styling**: Tailwind CSS v4 (OKLCH color space, CSS variables for light/dark theming)
- **State Management**: Zustand (with LocalStorage persistence)
- **Forms**: React Hook Form + Zod validation
- **Date/Time**: Luxon (wrapped in custom DateTime class)
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React (wrapped via custom Icon component)
- **Component Variants**: Class-variance-authority (CVA)
- **UI Primitives**: Base UI (formerly Radix) for Tabs, Switch, etc.
- **PWA**: vite-plugin-pwa with Workbox
- **Build Optimization**: React Compiler (babel-plugin-react-compiler targeting React 19)
- **Package Manager**: pnpm

## Key Architecture Decisions
- **Offline-first**: Uses Zustand + LocalStorage, no backend yet
- **No Server Components**: Pure client-side React app
- **Draft vs Persisted state**: Drafts are local form state, only validated entities enter global store
- **Reusable forms**: Same form component for Create & Edit, pages orchestrate
- **forwardRef deprecated**: React 19 pattern — pass `ref` as a regular prop
- **Path aliases**: `@/` maps to `src/`
