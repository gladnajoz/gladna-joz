import { useState } from "react";
import { useApp } from "../state/AppContext";
import { Modal } from "../components/Modal";
import { TaskEditor } from "../components/TaskEditor";
import { SortableList, SortableItem } from "../components/Sortable";
import { MiniCalendar } from "../components/MiniCalendar";
import type { Task } from "../types";
import { todayISO } from "../lib/date";
import { DURATION_OPTIONS, DEFAULT_DURATION_MINS, endTime } from "../lib/time";

export function Later() {
  const { data, loading, addTask, updateTask, deleteTask, reorderLater } = useApp();
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [scheduling, setScheduling] = useState<Task | null>(null);

  if (loading) return <div className="center-screen">Loading…</div>;

  const laters = data.tasks
    .filter((t) => t.recurrence.type === "later")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Later</h1>
          <div className="sub">Undated ideas — drag to prioritise</div>
        </div>
        <button className="btn primary" onClick={() => setCreating(true)}>
          + New
        </button>
      </div>

      {laters.length === 0 ? (
        <div className="card pad empty">
          Nothing waiting. Park undated tasks here and schedule them when ready.
        </div>
      ) : (
        <SortableList ids={laters.map((t) => t.id)} onReorder={reorderLater}>
          {laters.map((t) => (
            <SortableItem key={t.id} id={t.id}>
              {({ attributes, listeners }) => (
                <div className="list-row" style={{ marginBottom: 8 }}>
                  <span className="drag-handle" {...attributes} {...listeners}>
                    ⠿
                  </span>
                  <div className="body" onClick={() => setEditing(t)}>
                    <div className="title">{t.title}</div>
                    <div className="meta">
                      <span
                        className={"chip " + (t.list === "gladna.joz" ? "joz" : "personal")}
                      >
                        {t.list === "gladna.joz" ? "gladna.joz" : "Personal"}
                      </span>
                    </div>
                  </div>
                  <button className="btn sm primary" onClick={() => setScheduling(t)}>
                    Schedule
                  </button>
                </div>
              )}
            </SortableItem>
          ))}
        </SortableList>
      )}

      {creating && (
        <TaskEditor
          defaultList="gladna.joz"
          onClose={() => setCreating(false)}
          onSave={(d) => {
            // Force it onto the Later list regardless of chosen recurrence.
            addTask({ ...d, recurrence: { type: "later" } });
            setCreating(false);
          }}
        />
      )}

      {editing && (
        <TaskEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(d) => {
            updateTask(editing.id, d);
            setEditing(null);
          }}
          onDelete={() => {
            deleteTask(editing.id);
            setEditing(null);
          }}
        />
      )}

      {scheduling && (
        <ScheduleModal
          task={scheduling}
          onClose={() => setScheduling(null)}
          onSchedule={(date, startTime, durationMins) => {
            updateTask(scheduling.id, {
              recurrence: { type: "none", date },
              startTime,
              durationMins,
            });
            setScheduling(null);
          }}
          onOpenFull={() => {
            const t = scheduling;
            setScheduling(null);
            setEditing(t);
          }}
        />
      )}
    </div>
  );
}

function ScheduleModal({
  task,
  onClose,
  onSchedule,
  onOpenFull,
}: {
  task: Task;
  onClose: () => void;
  onSchedule: (date: string, startTime?: string, durationMins?: number) => void;
  onOpenFull: () => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [timed, setTimed] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [durationMins, setDurationMins] = useState(DEFAULT_DURATION_MINS);

  return (
    <Modal title={`Schedule: ${task.title}`} onClose={onClose}>
      <div className="stack">
        <div className="field">
          <div className="row">
            <label style={{ margin: 0 }}>Give it a date</label>
            <div className="spacer" />
            <MiniCalendar value={date} buttonLabel="Pick" onPick={setDate} />
          </div>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="field">
          <div className="row">
            <label style={{ margin: 0 }}>Time</label>
            <div className="spacer" />
            <button
              type="button"
              className={"btn sm" + (timed ? " primary" : "")}
              onClick={() => setTimed((v) => !v)}
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

        <button
          className="btn primary block"
          onClick={() =>
            onSchedule(
              date,
              timed ? startTime : undefined,
              timed ? durationMins : undefined,
            )
          }
        >
          Schedule it
        </button>
        <button className="btn block" onClick={onOpenFull}>
          Set a repeat instead…
        </button>
      </div>
    </Modal>
  );
}
