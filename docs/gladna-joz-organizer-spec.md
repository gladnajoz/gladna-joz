# gladna.joz Organizer — Project Spec

A personal, single-user web app for organizing gladna.joz (Instagram food
profile) business work and personal life tasks: tasks, a food-idea
checklist/recipe library, a shopping lists, and a posting-plan calendar.

## Context

- Single user, no accounts/login, no collaborators.
- Used on both phone (day-to-day checking things off) and desktop
  (planning) — needs to be **responsive, mobile-first**.
- Data must **sync across devices** — this is a real webapp with
  persistent storage, not a local-only/offline tool.
- No live Meta Ads API integration (out of scope — see "Explicitly out of
  scope" below).

## Screens / Sections

1. **Dashboard** (home screen) — shows at a glance:
   - Today's Tasks (gladna.joz + Personal, resolved from the Recurrence
     engine for today's date)
   - Today's Calendar day entry (linked Food idea + story topic notes)
   - Count of unbought items across the shopping lists
2. **Tasks** — two separate lists: **gladna.joz** and **Personal**. Same
   engine underneath (see Recurrence below).
3. **Content Checklist** — list of Food ideas with Made / Posted
   checkboxes.
4. **Recipe Library** — same Food ideas as the checklist, shown with
   Written status and (once written) full recipe detail.
5. **Calendar** — posting-plan calendar view. Each day can optionally link
   to one Food idea, and can hold free-text story-topic notes.
6. **Shopping Lists** — two separate lists: **gladna.joz** and
   **Personal**, identical structure.
7. **Later list** — undated Tasks (gladna.joz or Personal), manually
   reorderable, waiting to be assigned a date.

## Data Model

### Task
- `title`: string
- `list`: `"gladna.joz"` | `"personal"`
- `recurrence`: one of:
  - `{ type: "none", date: <date> }` — one-off, tied to a specific date
  - `{ type: "weekday", days: [Mon..Sun subset], intervalWeeks: number }`
    — repeats on chosen weekdays, every N weeks (N=1 default/weekly, N=2
    for biweekly, etc. — e.g. fishtank cleaning = Saturday, every 2 weeks)
  - `{ type: "monthly", dayOfMonth: number }` — repeats on a specific date
    each month
  - `{ type: "later" }` — no date yet; sits in the Later list until the
    user assigns it a date (moves it onto the calendar / gives it a real
    recurrence)
- `sortOrder`: number — only meaningful for `type: "later"` items,
  manually reorderable by the user (drag to rearrange)
- `done`: boolean (for one-off) or a per-occurrence completion record (for
  recurring types — completing a Tuesday instance shouldn't mark all
  Tuesdays as done forever, just that date's occurrence)

### Food idea
One entity, shown in two views — not two separate records:
- `name`: string
- `made`: boolean
- `posted`: boolean
- `written`: boolean (recipe written or not)
- `ingredients`: text (optional, filled in once written)
- `steps`: text (optional, filled in once written)
- `notes`: text (optional)
- `source`: text (optional — a link, or a note like "Instagram/mom/hen",
  for ideas that come from somewhere else rather than being original)

Every Food idea starts life on the Content Checklist. Writing the recipe
just fills in fields on the same record — it never creates a second entry.
Food ideas are never added directly to the Recipe Library.

### Calendar day
- `date`: date
- `foodIdeaId`: optional link to a Food idea (e.g. "Tue: keleraba
  karpaccio — filming")
- `storyTopics`: free text / small list — independent of the linked Food
  idea

### Shopping list item
- `list`: `"gladna.joz"` | `"personal"`
- `name`: string
- `bought`: boolean
- `priority`: (e.g. low/medium/high, or a simple number)
- `whereToFind`: string
- `link`/`note`: optional string

## Explicitly out of scope (for now)

- **Live Meta Ads API integration.** Not feasible to build securely here
  — no safe place to hold Meta OAuth credentials, and Meta requires app
  review/business verification for Marketing API access. If this becomes
  important later, it likely means building this as a real backend
  service (not just a static/client webapp) — that's a bigger, separate
  project.
- **Manual ad-performance tracking** (views/follows/likes logs). Considered
  and deliberately skipped — the numbers change too often to be worth the
  manual-upkeep cost, and it's easy to neglect. Revisit later only if the
  rest of the app is in daily real use and there's a clear appetite for
  it.

## Design notes

- Mobile-first responsive layout; should feel good for quick daily
  check-offs on a phone, and fine for deeper planning on desktop.
- Everything is single-user — no auth, no multi-user permissions needed.
- The Later list and shopping lists both need drag-to-reorder /
  drag-to-check UX that works well on touch.
