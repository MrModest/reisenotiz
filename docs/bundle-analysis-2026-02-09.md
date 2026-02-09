# Bundle Analysis Report

**Date**: 2026-02-09
**Main chunk**: `dist/assets/index-BiZO-wJI.js` — 1098 kB (339 kB gzip)
**Total chunks**: 1666 (1 main + 1665 icon chunks)

## Main Chunk Composition

Pre-minification sizes from rollup-plugin-visualizer (3024 kB total raw):

| Package | Size (raw) | % | Notes |
|---|---|---|---|
| react-dom | 548 kB | 18.1% | React runtime, unavoidable |
| @base-ui/react | 401 kB | 13.3% | UI primitives, possibly not tree-shaken |
| luxon | 256 kB | 8.5% | Not tree-shakeable (monolithic class) |
| [app code] | 251 kB | 8.3% | Application source |
| lucide-react | 238 kB | 7.9% | Icon infrastructure/runtime |
| framer-motion | 237 kB | 7.8% | Animation core |
| react-router | 206 kB | 6.8% | Routing |
| react-day-picker | 146 kB | 4.8% | Date picker component |
| zod | 117 kB | 3.9% | Schema validation |
| date-fns | 116 kB | 3.8% | Pulled in by react-day-picker |
| motion-dom | 106 kB | 3.5% | Animation DOM layer |
| react-hook-form | 100 kB | 3.3% | Form library |
| tailwind-merge | 88 kB | 2.9% | Class merging utility |
| @base-ui/utils | 35 kB | 1.2% | Base UI utilities |
| tabbable | 27 kB | 0.9% | Focus management |
| @floating-ui/dom | 25 kB | 0.8% | Floating UI DOM |
| @floating-ui/core | 23 kB | 0.8% | Floating UI core |
| react | 21 kB | 0.7% | React core |
| @date-fns/tz | 14 kB | 0.4% | Timezone support for date-fns |
| scheduler | 11 kB | 0.4% | React scheduler |
| reselect | 10 kB | 0.3% | Memoized selectors |
| @floating-ui/utils | 9 kB | 0.3% | Floating UI utilities |
| @floating-ui/react-dom | 8 kB | 0.3% | Floating UI React bindings |
| motion-utils | 7 kB | 0.2% | Animation utilities |
| zustand | 7 kB | 0.2% | State management |

## Key Observations

### 1. @base-ui/react — 401 kB (13.3%)
Largest surprise contributor. The entire package appears to be bundled rather than tree-shaken. Worth investigating which components are actually used and whether imports can be narrowed.

### 2. Dual date libraries — luxon (256 kB) + date-fns (116 kB) = 372 kB
The app uses luxon as its primary date library, but react-day-picker pulls in date-fns as a dependency. Two date libraries are being shipped together.

### 3. lucide-react — 238 kB runtime
Despite individual icons being code-split into 1665 separate chunks, the core runtime/registry still contributes 238 kB to the main bundle. This suggests the full icon set metadata is being included.

### 4. motion — 344 kB combined (framer-motion + motion-dom + motion-utils)
The animation library is a substantial portion of the bundle.

### 5. No route-level code splitting
All routes are eagerly loaded from `src/routes.ts`. Lazy-loading routes via `React.lazy()` would move page-specific code (and their dependencies) out of the initial bundle.

## Potential Optimizations

- **Lazy routes**: Split routes with `React.lazy()` to defer loading of non-critical pages
- **@base-ui/react**: Audit imports, check if tree-shaking is working correctly
- **lucide-react**: Investigate why the icon runtime is 238 kB — may need to adjust how icons are imported/registered
- **Date libraries**: Consider configuring react-day-picker to use luxon adapter to avoid shipping date-fns alongside luxon
- **Manual chunks**: Use `build.rollupOptions.output.manualChunks` to split vendor code into separate cacheable chunks (e.g., react, router, animation)
