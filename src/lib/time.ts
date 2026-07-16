// Time-of-day helpers for task scheduling (start time + duration).

export const DEFAULT_DURATION_MINS = 60;

export const DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 150, label: "2.5 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
];

// "HH:MM" -> minutes since midnight.
export function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// minutes since midnight -> "HH:MM" (wraps within a day).
export function formatMinutes(mins: number): string {
  const m = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function endTime(start: string, durationMins: number): string {
  return formatMinutes(parseTime(start) + durationMins);
}

// "10:00 – 11:00" style range for display.
export function formatRange(start?: string, durationMins?: number): string | null {
  if (!start) return null;
  const dur = durationMins ?? DEFAULT_DURATION_MINS;
  return `${start} – ${endTime(start, dur)}`;
}
