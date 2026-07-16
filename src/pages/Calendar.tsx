import { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";
import { Modal } from "../components/Modal";
import { MiniCalendar } from "../components/MiniCalendar";
import type { FoodIdea } from "../types";
import {
  monthGrid,
  MONTH_LABELS,
  WEEKDAY_LABELS,
  todayISO,
  fromISO,
  toISO,
  formatLong,
} from "../lib/date";

export function Calendar() {
  const { data, loading, setCalendarDay } = useApp();
  const today = todayISO();
  const now = fromISO(today);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const foodById = useMemo(
    () => new Map(data.foodIdeas.map((f) => [f.id, f])),
    [data.foodIdeas],
  );
  const dayMap = useMemo(
    () => new Map(data.calendarDays.map((c) => [c.date, c])),
    [data.calendarDays],
  );

  if (loading) return <div className="center-screen">Loading…</div>;

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

  const selectedDay = selected ? dayMap.get(selected) : undefined;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Calendar</h1>
          <div className="sub">Link a food idea & jot story topics</div>
        </div>
        <MiniCalendar
          value={toISO(new Date(year, month, 1))}
          buttonLabel="Jump to"
          onPick={(iso) => {
            const d = fromISO(iso);
            setYear(d.getFullYear());
            setMonth(d.getMonth());
            setSelected(iso);
          }}
        />
      </div>

      <div className="row" style={{ marginBottom: 12 }}>
        <button className="icon-btn" onClick={prev} aria-label="Previous month">
          ◀
        </button>
        <div className="spacer" />
        <strong>
          {MONTH_LABELS[month]} {year}
        </strong>
        <div className="spacer" />
        <button className="icon-btn" onClick={next} aria-label="Next month">
          ▶
        </button>
      </div>

      <div className="cal" style={{ marginBottom: 6 }}>
        {/* Monday-first day-of-week labels */}
        {[1, 2, 3, 4, 5, 6, 0].map((i) => (
          <div key={i} className="dow">
            {WEEKDAY_LABELS[i]}
          </div>
        ))}
      </div>

      <div className="stack">
        {grid.map((week, wi) => (
          <div key={wi} className="cal">
            {week.map((iso) => {
              const d = fromISO(iso);
              const inMonth = d.getMonth() === month;
              const cd = dayMap.get(iso);
              const food = cd?.foodIdeaId ? foodById.get(cd.foodIdeaId) : undefined;
              return (
                <button
                  key={iso}
                  className={
                    "cell" + (inMonth ? "" : " out") + (iso === today ? " today" : "")
                  }
                  onClick={() => setSelected(iso)}
                >
                  <span className="d">{d.getDate()}</span>
                  {food && <span className="food">{food.name}</span>}
                  {cd?.storyTopics ? <span className="story-dot" /> : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selected && (
        <DayEditor
          key={selected}
          date={selected}
          foodIdeas={data.foodIdeas}
          initialFoodId={selectedDay?.foodIdeaId ?? ""}
          initialTopics={selectedDay?.storyTopics ?? ""}
          onClose={() => setSelected(null)}
          onSave={(foodId, topics) => {
            setCalendarDay(selected, {
              foodIdeaId: foodId || undefined,
              storyTopics: topics,
            });
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

function DayEditor({
  date,
  foodIdeas,
  initialFoodId,
  initialTopics,
  onClose,
  onSave,
}: {
  date: string;
  foodIdeas: FoodIdea[];
  initialFoodId: string;
  initialTopics: string;
  onClose: () => void;
  onSave: (foodId: string, topics: string) => void;
}) {
  const [foodId, setFoodId] = useState(initialFoodId);
  const [topics, setTopics] = useState(initialTopics);

  return (
    <Modal title={formatLong(date)} onClose={onClose}>
      <div className="stack">
        <div className="field">
          <label>Linked food idea</label>
          <select
            className="select"
            value={foodId}
            onChange={(e) => setFoodId(e.target.value)}
          >
            <option value="">— none —</option>
            {foodIdeas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Story topics</label>
          <textarea
            className="textarea"
            value={topics}
            placeholder="e.g. BTS of the slicing · 'guess the veg' poll"
            onChange={(e) => setTopics(e.target.value)}
          />
        </div>
        <div className="row">
          <div className="spacer" />
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={() => onSave(foodId, topics)}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
