// Date helpers. All dates are handled as local-time yyyy-mm-dd strings so the
// same calendar day means the same thing regardless of timezone.

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// yyyy-mm-dd for a Date, in local time.
export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Parse a yyyy-mm-dd string into a local-time Date at midnight.
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function weekdayOf(iso: string): number {
  return fromISO(iso).getDay();
}

export function dayOfMonth(iso: string): number {
  return fromISO(iso).getDate();
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Monday-based start of week, returned as ISO.
export function startOfWeekMonday(iso: string): string {
  const d = fromISO(iso);
  const day = d.getDay(); // 0 Sun..6 Sat
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  d.setDate(d.getDate() + diff);
  return toISO(d);
}

// Whole weeks between two ISO dates (a - b), using Monday week starts.
export function weeksBetween(aISO: string, bISO: string): number {
  const a = fromISO(startOfWeekMonday(aISO)).getTime();
  const b = fromISO(startOfWeekMonday(bISO)).getTime();
  return Math.round((a - b) / (7 * 24 * 60 * 60 * 1000));
}

// Human labels.
export function formatLong(iso: string): string {
  const d = fromISO(iso);
  return `${WEEKDAY_FULL[d.getDay()]}, ${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
}

export function formatShort(iso: string): string {
  const d = fromISO(iso);
  return `${MONTH_LABELS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

export function isSameISO(a: string, b: string): boolean {
  return a === b;
}

// Build a month grid (arrays of weeks, each 7 ISO strings, Monday-first).
// Leading/trailing days from adjacent months are included so the grid is full.
export function monthGrid(year: number, monthIndex: number): string[][] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const gridStart = fromISO(startOfWeekMonday(toISO(firstOfMonth)));
  const weeks: string[][] = [];
  const cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(toISO(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    // stop after we've passed the month and completed a week
    const lastDay = fromISO(week[6]);
    if (lastDay.getMonth() !== monthIndex && lastDay > new Date(year, monthIndex, 28)) {
      break;
    }
  }
  return weeks;
}
