# React Entity Create / View / Edit Flow (Best Practice)

> **Note:** `Task`, `tasks`, and to-do lists are used throughout this document **purely as illustrative examples**.
> The same patterns apply to *any entity* (e.g. users, projects, bookings, documents, messages).
> When applying this guidance, substitute `Task` with the actual domain entity instead of literally creating a task model.

This note documents a **clean, scalable pattern** for implementing Create / View / Edit flows in a React application. It applies both to **server-backed apps** and **offline‑first apps using Zustand + LocalStorage**.

The core idea: **draft state is local; persisted state is global**.

---

## Core Principles

1. **Draft ≠ Persisted Entity**

   * New or edited entities exist as *local form state* until saved
   * Only validated, complete entities enter global state (store / cache)

2. **Forms are reusable; pages are not**

   * Same form component for Create & Edit
   * Separate pages orchestrate data, navigation, persistence

3. **Explicit routes beat mode flags**

   * Avoid `mode="edit"` or giant conditional pages
   * Use separate routes and pages

---

## Recommended Routes

```
/lists/:listId/tasks/new            → Create
/lists/:listId/tasks/:taskId        → View
/lists/:listId/tasks/:taskId/edit   → Edit
```

This keeps navigation, refresh, and deep linking predictable.

---

## Component Structure

```
tasks/
├── TaskForm.tsx        // reusable form (create + edit)
├── TaskView.tsx        // read‑only details
├── NewTaskPage.tsx     // create orchestration
├── TaskDetailsPage.tsx // view orchestration
└── EditTaskPage.tsx    // edit orchestration
```

---

## Responsibilities by Layer

### Page Components

* Read route params
* Fetch data (or read from store)
* Provide default values
* Call persistence actions
* Handle navigation

### Form Component (`TaskForm`)

* Render inputs
* Manage draft state
* Client-side validation
* Call `onSubmit`

**Form never:**

* Fetches data
* Navigates
* Knows if it’s create or edit

### View Component (`TaskView`)

* Purely read-only rendering

---

## Shared TaskForm (Create + Edit)

Key traits:

* Controlled via `defaultValues`
* Client-side validation
* No persistence logic

Used by:

* Create page (empty + defaults)
* Edit page (existing entity)

---

## Create Flow

1. Navigate to `/tasks/new`
2. Page provides defaults (listId, today’s date)
3. Form manages draft state
4. On submit:

   * Validate
   * Persist
   * Navigate back

Draft **never** enters global state.

---

## View Flow

* Fetch/read persisted entity
* Render via `TaskView`
* Provide link/button to Edit

No form, no draft state.

---

## Edit Flow

1. Fetch/read persisted entity
2. Pass entity as `defaultValues` to `TaskForm`
3. User edits local draft
4. On submit:

   * Validate
   * Update persisted entity
   * Navigate back

Again: draft stays local until save.

---

## Server‑Backed vs Offline‑First

### Server‑Backed

* Persistence: API calls
* Cache: TanStack Query
* Errors: server validation

### Offline‑First (Zustand + LocalStorage)

* Persistence: Zustand store actions
* Storage: LocalStorage / IndexedDB
* Errors: domain validation

**Architecture does not change. Only the persistence layer does.**

---

## Zustand Store Rules (Offline‑First)

* Store **only valid, complete entities**
* Never store drafts
* Validate invariants inside store actions

Example rules:

* Title required
* Description required
* ID must exist

This prevents corrupted state surviving reloads.

---

## Validation Strategy

* **Form:** UX validation (required fields, lengths)
* **Store / API:** invariant validation (last line of defense)

Never rely on only one layer.

---

## What NOT to Do

❌ Store half‑baked entities in global state
❌ Reuse pages with `mode` flags
❌ Let forms fetch or navigate
❌ Optimistically insert invalid entities
❌ Mix draft and persisted concerns

Offline‑first apps suffer *more* from these mistakes.

---

## Summary Rules of Thumb

* New entity = local draft
* Persisted entity = global state
* Forms are reusable
* Pages orchestrate
* View is read‑only
* Persist first, then reflect

This pattern stays maintainable as complexity, UX polish, and sync logic grow.
