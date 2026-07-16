import { useEffect, useRef, useState } from "react";
import {
  monthGrid,
  MONTH_LABELS,
  WEEKDAY_LABELS,
  fromISO,
  todayISO,
} from "../lib/date";

// A small Google-Calendar-style month picker that opens as a dropdown popover.
// `value` is the selected/anchor date; `onPick` fires with the chosen ISO date.
export function MiniCalendar({
  value,
  onPick,
  buttonLabel,
}: {
  value: string;
  onPick: (iso: string) => void;
  buttonLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const sel = fromISO(value);
  const [year, setYear] = useState(sel.getFullYear());
  const [month, setMonth] = useState(sel.getMonth());
  const today = todayISO();

  // Re-sync to the selected value each time it opens.
  useEffect(() => {
    if (open) {
      const d = fromISO(value);
      setYear(d.getFullYear());
      setMonth(d.getMonth());
    }
  }, [open, value]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const grid = monthGrid(year, month);
  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className="mini-wrap" ref={ref}>
      <button className="btn sm" onClick={() => setOpen((o) => !o)}>
        🗓️ {buttonLabel} ▾
      </button>
      {open && (
        <div className="mini-pop">
          <div className="mini-head">
            <button className="icon-btn" onClick={prev} aria-label="Previous month">
              ◀
            </button>
            <strong>
              {MONTH_LABELS[month]} {year}
            </strong>
            <button className="icon-btn" onClick={next} aria-label="Next month">
              ▶
            </button>
          </div>
          <div className="mini-grid">
            {[1, 2, 3, 4, 5, 6, 0].map((i) => (
              <div key={i} className="mini-dow">
                {WEEKDAY_LABELS[i][0]}
              </div>
            ))}
            {grid.flat().map((iso) => {
              const d = fromISO(iso);
              const inMonth = d.getMonth() === month;
              return (
                <button
                  key={iso}
                  className={
                    "mini-cell" +
                    (inMonth ? "" : " out") +
                    (iso === value ? " sel" : "") +
                    (iso === today ? " today" : "")
                  }
                  onClick={() => {
                    onPick(iso);
                    setOpen(false);
                  }}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          <button
            className="btn sm block"
            style={{ marginTop: 8 }}
            onClick={() => {
              onPick(today);
              setOpen(false);
            }}
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
}
