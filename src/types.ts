// Core data model for the gladna.joz Organizer.
// See docs/gladna-joz-organizer-spec.md for the source of truth.

export type ListKind = "gladna.joz" | "personal";

export type Priority = "low" | "medium" | "high";

// Weekdays use JS getDay() convention: 0 = Sunday ... 6 = Saturday.
export type Recurrence =
  | { type: "none"; date: string } // one-off, tied to a specific date (yyyy-mm-dd)
  | { type: "weekday"; days: number[]; intervalWeeks: number; anchor: string } // repeats on weekdays, every N weeks
  | { type: "monthly"; dayOfMonth: number } // repeats on a day-of-month
  | { type: "later" }; // no date yet — lives in the Later list

export interface Task {
  id: string;
  title: string;
  list: ListKind;
  recurrence: Recurrence;
  sortOrder: number; // meaningful for "later" items (manual reorder)
  createdAt: string;
  // Optional scheduling — Google-Calendar style start time + duration.
  startTime?: string; // "HH:MM" (24h). Absent = no specific time.
  durationMins?: number; // defaults to 60 when a startTime is set
}

// Per-occurrence completion. Completing one Tuesday instance only marks that date.
export interface Completion {
  taskId: string;
  date: string; // yyyy-mm-dd
}

// One entity, shown in two views (Content Checklist + Recipe Library).
// The recipe fields map to the Instagram caption sections (see lib/caption.ts):
//   I name · II punchLine · III ingredients · IV steps · V tips · VI cta · VII hashtags
export interface FoodIdea {
  id: string;
  name: string; // I — name of the dish
  made: boolean;
  posted: boolean;
  written: boolean;
  punchLine?: string; // II
  ingredients?: string; // III (under "🍲 Sastojci:")
  steps?: string; // IV — the recipe (under "🥘 Recept:")
  tips?: string; // V — tips & tricks
  cta?: string; // VI — editable, defaults to CTA_DEFAULT
  hashtags?: string; // VII — editable, defaults to HASHTAGS_DEFAULT
  notes?: string; // private notes, NOT included in the copied caption
  source?: string;
  createdAt: string;
}

export interface CalendarDay {
  date: string; // yyyy-mm-dd — the key
  foodIdeaId?: string;
  storyTopics: string;
}

export interface ShoppingItem {
  id: string;
  list: ListKind;
  name: string;
  bought: boolean;
  priority: Priority;
  whereToFind?: string;
  note?: string;
  sortOrder: number;
}

export interface AppData {
  version: number;
  tasks: Task[];
  completions: Completion[];
  foodIdeas: FoodIdea[];
  calendarDays: CalendarDay[];
  shoppingItems: ShoppingItem[];
}

export const CURRENT_DATA_VERSION = 1;

export function emptyData(): AppData {
  return {
    version: CURRENT_DATA_VERSION,
    tasks: [],
    completions: [],
    foodIdeas: [],
    calendarDays: [],
    shoppingItems: [],
  };
}
