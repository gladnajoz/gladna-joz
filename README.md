# gladna.joz Organizer

A personal, single-user organizer for the **gladna.joz** food Instagram + personal
life: tasks, a food-idea content checklist, a recipe library, a posting-plan
calendar, and shopping lists. Mobile-first, warm/food-y UI.

Built from `docs/gladna-joz-organizer-spec.md`.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173  (add --host to open on your phone)
npm run build    # type-check + production build into dist/
```

To open on a phone on the same Wi-Fi: run `npm run dev -- --host` and visit the
Network URL it prints from your phone's browser.

## Screens

- **Home** — today's tasks (gladna.joz + personal), today's plan, count to buy.
- **Tasks** — recurring & one-off to-dos, two lists, with a recurrence editor
  (one-off date / weekly on weekdays / every N weeks / monthly).
- **Content** — food ideas with Made / Posted toggles.
- **Recipes** — the same food ideas, showing written status + full recipe detail.
- **Plan** — a posting calendar; each day can link a food idea + story-topic notes.
- **Shop** — two shopping lists, drag to reorder, tap to check off.
- **Later** — undated tasks parked for later; drag to prioritise, then schedule.

## Phase 1 vs Phase 2

- **Phase 1 (now):** all data is saved on the device via `localStorage`. Fully
  usable, no accounts, works offline. This is the version for the first test.
- **Phase 2 (later):** cross-device sync. Everything persists through a single
  `StorageAdapter` interface (`src/lib/storage.ts`). Swapping localStorage for a
  cloud backend (Supabase/Firebase) happens in `getAdapter()` only — no page or
  component code changes.

## Data

First run seeds example content so nothing is empty. It's all safe to delete and
replace. Data lives under the `localStorage` key `gladna-joz-organizer:v1`.

## Tech

Vite + React + TypeScript, React Router (hash router for zero-config static
hosting), `@dnd-kit` for touch-friendly drag-to-reorder.
