// Recurrence engine — resolves which tasks are due on a given date, and tracks
// per-occurrence completion so completing one instance of a recurring task
// doesn't mark every occurrence done.

import type { Task, Completion, Recurrence } from "../types";
import { weekdayOf, dayOfMonth, weeksBetween, daysInMonth, fromISO } from "./date";

// Does a single task occur on the given ISO date?
export function occursOn(rec: Recurrence, iso: string): boolean {
  switch (rec.type) {
    case "none":
      return rec.date === iso;
    case "weekday": {
      if (!rec.days.includes(weekdayOf(iso))) return false;
      const interval = Math.max(1, rec.intervalWeeks || 1);
      if (interval === 1) return true;
      const diff = Math.abs(weeksBetween(iso, rec.anchor));
      return diff % interval === 0;
    }
    case "monthly": {
      const d = fromISO(iso);
      const dim = daysInMonth(d.getFullYear(), d.getMonth());
      // Clamp: a "31st" task fires on the last day of shorter months.
      const target = Math.min(rec.dayOfMonth, dim);
      return dayOfMonth(iso) === target;
    }
    case "later":
      return false;
  }
}

// All tasks (optionally filtered) that occur on a date.
export function tasksForDate(tasks: Task[], iso: string): Task[] {
  return tasks.filter((t) => occursOn(t.recurrence, iso));
}

function completionKey(taskId: string, date: string): string {
  return `${taskId}|${date}`;
}

export function makeCompletionSet(completions: Completion[]): Set<string> {
  return new Set(completions.map((c) => completionKey(c.taskId, c.date)));
}

export function isDone(
  completions: Completion[] | Set<string>,
  taskId: string,
  date: string,
): boolean {
  const key = completionKey(taskId, date);
  if (completions instanceof Set) return completions.has(key);
  return completions.some((c) => c.taskId === taskId && c.date === date);
}

// Return a new completions array with the (task,date) occurrence toggled.
export function toggleCompletion(
  completions: Completion[],
  taskId: string,
  date: string,
): Completion[] {
  const exists = completions.some((c) => c.taskId === taskId && c.date === date);
  if (exists) {
    return completions.filter((c) => !(c.taskId === taskId && c.date === date));
  }
  return [...completions, { taskId, date }];
}

// A short human description of a recurrence, for list rows.
export function describeRecurrence(rec: Recurrence): string {
  switch (rec.type) {
    case "none":
      return "One-off";
    case "weekday": {
      const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const days = rec.days
        .slice()
        .sort((a, b) => a - b)
        .map((d) => labels[d])
        .join(", ");
      const interval = Math.max(1, rec.intervalWeeks || 1);
      if (interval === 1) return `Weekly · ${days || "—"}`;
      return `Every ${interval} weeks · ${days || "—"}`;
    }
    case "monthly":
      return `Monthly · day ${rec.dayOfMonth}`;
    case "later":
      return "Later";
  }
}
