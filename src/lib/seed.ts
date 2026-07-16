// First-run seed data so the app feels alive when opened for the first time.
// Everything here is example content the user can delete.

import type { AppData } from "../types";
import { CURRENT_DATA_VERSION } from "../types";
import { uid } from "./id";
import { todayISO, addDays, startOfWeekMonday } from "./date";

export function seedData(): AppData {
  const today = todayISO();
  const anchor = startOfWeekMonday(today);

  const soup = uid();
  const karpaccio = uid();
  const cookies = uid();

  return {
    version: CURRENT_DATA_VERSION,
    tasks: [
      {
        id: uid(),
        title: "Post reel to gladna.joz",
        list: "gladna.joz",
        recurrence: { type: "weekday", days: [1, 4], intervalWeeks: 1, anchor },
        sortOrder: 0,
        createdAt: today,
        startTime: "18:00",
        durationMins: 60,
      },
      {
        id: uid(),
        title: "Reply to comments & DMs",
        list: "gladna.joz",
        recurrence: { type: "none", date: today },
        sortOrder: 0,
        createdAt: today,
      },
      {
        id: uid(),
        title: "Clean the fishtank",
        list: "personal",
        recurrence: { type: "weekday", days: [6], intervalWeeks: 2, anchor },
        sortOrder: 0,
        createdAt: today,
      },
      {
        id: uid(),
        title: "Pay rent",
        list: "personal",
        recurrence: { type: "monthly", dayOfMonth: 1 },
        sortOrder: 0,
        createdAt: today,
      },
      {
        id: uid(),
        title: "Film a plating short",
        list: "gladna.joz",
        recurrence: { type: "later" },
        sortOrder: 0,
        createdAt: today,
      },
      {
        id: uid(),
        title: "Sort out props / backdrop",
        list: "gladna.joz",
        recurrence: { type: "later" },
        sortOrder: 1,
        createdAt: today,
      },
    ],
    completions: [],
    foodIdeas: [
      {
        id: karpaccio,
        name: "Keleraba karpačo",
        made: false,
        posted: false,
        written: true,
        punchLine: "Najlepši način da iznenadiš goste povrćem 🌿",
        ingredients:
          "1 keleraba\nMaslinovo ulje\nLimun\nSo u ljuspicama\nChili\nNana",
        steps:
          "Iseci kelerabu na papirno tanke ploške.\nPreliј maslinovim uljem i limunom.\nZačini sa solju, chilijem i nanom.",
        tips: "Koristi mandolinu za tanje ploške\nDodaj so tek pred serviranje",
        source: "original",
        createdAt: today,
      },
      {
        id: soup,
        name: "Roasted tomato soup",
        made: true,
        posted: false,
        written: false,
        source: "mom",
        createdAt: today,
      },
      {
        id: cookies,
        name: "Tahini cookies",
        made: true,
        posted: true,
        written: true,
        ingredients: "Tahini, sugar, flour, egg, vanilla, sesame",
        steps: "Cream tahini + sugar. Add egg + vanilla. Fold flour. Roll in sesame. Bake 12 min at 175°C.",
        notes: "Crowd favourite — reshoot in better light next time.",
        source: "Instagram",
        createdAt: today,
      },
    ],
    calendarDays: [
      {
        date: today,
        foodIdeaId: karpaccio,
        storyTopics: "BTS of the slicing + 'guess the veg' poll",
      },
      {
        date: addDays(today, 2),
        storyTopics: "Market haul",
      },
    ],
    shoppingItems: [
      {
        id: uid(),
        list: "gladna.joz",
        name: "Kohlrabi (x2)",
        bought: false,
        priority: "high",
        whereToFind: "Farmers market",
        sortOrder: 0,
      },
      {
        id: uid(),
        list: "gladna.joz",
        name: "Flaky salt",
        bought: false,
        priority: "medium",
        whereToFind: "Deli aisle",
        sortOrder: 1,
      },
      {
        id: uid(),
        list: "personal",
        name: "Fish food",
        bought: false,
        priority: "low",
        sortOrder: 0,
      },
      {
        id: uid(),
        list: "personal",
        name: "Dish soap",
        bought: true,
        priority: "low",
        sortOrder: 1,
      },
    ],
  };
}
