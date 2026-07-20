import { useState } from "react";
import type { ListKind, Recurrence, Task } from "../types";
import { Modal } from "./Modal";
import { WEEKDAY_LABELS, todayISO } from "../lib/date";
import { startOfWeekMonday } from "../lib/date";
import { DURATION_OPTIONS, DEFAULT_DURATION_MINS, endTime } from "../lib/time";

type RecKind = Recurrence["type"];

export interface TaskDraft {
  title: string;
  list: ListKind;
  recurrence: Recurrence;
  startTime?: string;
  durationMins?: number;
  notes?: string;
}

export function TaskEditor({
  initial,
  defaultList,
  onSave,
  onClose,
  onDelete,
}: {
  initial?: Task;
  defaultList?: ListKind;
  onSave: (data: TaskDraft) => void;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [list, setList] = useState<ListKind>(initial?.list ?? defaultList ?? "gladna.joz");
  const [kind, setKind] = useState<RecKind>(initial?.recurrence.type ?? "none");

  // Scheduling (time of day)
  const [timed, setTimed] = useState(Boolean(initial?.startTime));
  const [startTime, setStartTime] = useState(initial?.startTime ?? "09:00");
  const [durationMins, setDurationMins] = useState(
    initial?.durationMins ?? DEFAULT_DURATION_MINS,
  );

  // sub-fields
  const [date, setDate] = useState(
    initial?.recurrence.type === "none" ? initial.recurrence.date : todayISO(),
  );
  const [days, setDays] = useState<number[]>(
    initial?.recurrence.type === "weekday" ? initial.recurrence.days : [1],
  );
  const [intervalWeeks, setIntervalWeeks] = useState(
    initial?.recurrence.type === "weekday" ? initial.recurrence.intervalWeeks : 1,
  );
  const [dayOfMonth, setDayOfMonth] = useState(
    initial?.recurrence.type === "monthly" ? initial.recurrence.dayOfMonth : 1,
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [dirty, setDirty] = useState(false);

  const toggleDay = (d: number) => {
    setDirty(true);
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const buildRecurrence = (): Recurrence => {
    switch (kind) {
      case "none":
        return { type: "none", date };
      case "weekday":
        return {
          type: "weekday",
          days: days.length ? days : [1],
          intervalWeeks: Math.max(1, intervalWeeks),
          anchor:
            initial?.recurrence.type === "weekday"
              ? initial.recurrence.anchor
              : startOfWeekMonday(todayISO()),
        };
      case "monthly":
        return { type: "monthly", dayOfMonth: Math.min(31, Math.max(1, dayOfMonth)) };
      case "later":
        return { type: "later" };
    }
  };

  const submit = () => {
    if (!title.trim()) return;
    // Time only applies to dated/recurring tasks, never to "later".
    const useTime = timed && kind !== "later";
    onSave({
      title: title.trim(),
      list,
      recurrence: buildRecurrence(),
      startTime: useTime ? startTime : undefined,
      durationMins: useTime ? durationMins : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal
      title={initial ? "Edit task" : "New task"}
      onClose={onClose}
      dirty={dirty}
      onSave={submit}
    >
      <div className="stack" onChange={() => setDirty(true)}>
        <div className="field">
          <label>Task</label>
          <input
            className="input"
            value={title}
            autoFocus
            placeholder="e.g. Post reel to gladna.joz"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        <div className="field">
          <label>List</label>
          <div className="segmented">
            <button
              className={list === "gladna.joz" ? "active" : ""}
              onClick={() => {
                setDirty(true);
                setList("gladna.joz");
              }}
            >
              gladna.joz
            </button>
            <button
              className={list === "personal" ? "active" : ""}
              onClick={() => {
                setDirty(true);
                setList("personal");
              }}
            >
              Personal
            </button>
          </div>
        </div>

        <div className="field">
          <label>Repeat</label>
          <select
            className="select"
            value={kind}
            onChange={(e) => setKind(e.target.value as RecKind)}
          >
            <option value="none">One-off (specific date)</option>
            <option value="weekday">Weekly / on weekdays</option>
            <option value="monthly">Monthly (day of month)</option>
            <option value="later">Later (no date yet)</option>
          </select>
        </div>

        {kind === "none" && (
          <div className="field">
            <label>Date</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        )}

        {kind === "weekday" && (
          <>
            <div className="field">
              <label>On these days</label>
              <div className="weekday-picker">
                {WEEKDAY_LABELS.map((lbl, i) => (
                  <button
                    key={i}
                    className={days.includes(i) ? "on" : ""}
                    onClick={() => toggleDay(i)}
                    type="button"
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Every</label>
              <select
                className="select"
                value={intervalWeeks}
                onChange={(e) => setIntervalWeeks(Number(e.target.value))}
              >
                <option value={1}>Every week</option>
                <option value={2}>Every 2 weeks</option>
                <option value={3}>Every 3 weeks</option>
                <option value={4}>Every 4 weeks</option>
              </select>
            </div>
          </>
        )}

        {kind === "monthly" && (
          <div className="field">
            <label>Day of month</label>
            <input
              type="number"
              min={1}
              max={31}
              className="input"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(Number(e.target.value))}
            />
            <span className="faint" style={{ fontSize: "0.78rem" }}>
              Days past the end of a short month fall on its last day.
            </span>
          </div>
        )}

        {kind === "later" && (
          <p className="muted" style={{ fontSize: "0.88rem", margin: 0 }}>
            This goes to the <strong>Later</strong> list until you give it a date.
          </p>
        )}

        {kind !== "later" && (
          <div className="field">
            <div className="row">
              <label style={{ margin: 0 }}>Time</label>
              <div className="spacer" />
              <button
                type="button"
                className={"btn sm" + (timed ? " primary" : "")}
                onClick={() => {
                  setDirty(true);
                  setTimed((v) => !v);
                }}
              >
                {timed ? "✓ Scheduled" : "+ Add time"}
              </button>
            </div>
            {timed && (
              <>
                <div className="time-row" style={{ marginTop: 8 }}>
                  <div className="field">
                    <label>Start</label>
                    <input
                      type="time"
                      className="input"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Duration</label>
                    <select
                      className="select"
                      value={durationMins}
                      onChange={(e) => setDurationMins(Number(e.target.value))}
                    >
                      {DURATION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <span className="time-range-hint" style={{ marginTop: 6 }}>
                  {startTime} – {endTime(startTime, durationMins)}
                </span>
              </>
            )}
          </div>
        )}

        <div className="field">
          <label>Notes</label>
          <textarea
            className="textarea"
            value={notes}
            placeholder={"One note per line…\ne.g. bring the good camera\ncall supplier first"}
            onChange={(e) => setNotes(e.target.value)}
          />
          <span className="faint" style={{ fontSize: "0.78rem" }}>
            Each line shows as a • bullet.
          </span>
        </div>

        <div className="row" style={{ marginTop: 6 }}>
          {onDelete && (
            <button className="btn danger" onClick={onDelete}>
              Delete
            </button>
          )}
          <div className="spacer" />
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={submit}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
