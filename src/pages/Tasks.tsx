import { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";
import { Check } from "../components/Check";
import { TaskEditor } from "../components/TaskEditor";
import { Toolbar, FilterChips } from "../components/Toolbar";
import { TaskNotes } from "../components/TaskNotes";
import type { ListKind, Task } from "../types";
import { todayISO } from "../lib/date";
import { formatRange } from "../lib/time";
import { isDone, makeCompletionSet, describeRecurrence, occursOn } from "../lib/recurrence";

type TypeFilter = "all" | "none" | "weekday" | "monthly";

export function Tasks() {
  const { data, loading, addTask, updateTask, deleteTask, toggleTaskDone } = useApp();
  const [list, setList] = useState<ListKind>("gladna.joz");
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const today = todayISO();

  const doneSet = useMemo(() => makeCompletionSet(data.completions), [data.completions]);

  if (loading) return <div className="center-screen">Loading…</div>;

  const q = search.trim().toLowerCase();
  const tasks = data.tasks
    .filter((t) => t.list === list && t.recurrence.type !== "later")
    .filter((t) => typeFilter === "all" || t.recurrence.type === typeFilter)
    .filter((t) => !q || t.title.toLowerCase().includes(q))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Tasks</h1>
          <div className="sub">Recurring & one-off to-dos</div>
        </div>
        <button className="btn primary" onClick={() => setCreating(true)}>
          + New
        </button>
      </div>

      <div className="segmented" style={{ marginBottom: 14 }}>
        <button
          className={list === "gladna.joz" ? "active" : ""}
          onClick={() => setList("gladna.joz")}
        >
          gladna.joz
        </button>
        <button
          className={list === "personal" ? "active" : ""}
          onClick={() => setList("personal")}
        >
          Personal
        </button>
      </div>

      <Toolbar search={search} onSearch={setSearch} placeholder="Search tasks…">
        <FilterChips
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "All" },
            { value: "none", label: "One-off" },
            { value: "weekday", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
          ]}
        />
      </Toolbar>

      {tasks.length === 0 ? (
        <div className="card pad empty">
          {q || typeFilter !== "all"
            ? "No tasks match."
            : `No ${list === "gladna.joz" ? "gladna.joz" : "personal"} tasks yet. Add one!`}
        </div>
      ) : (
        <div>
          {tasks.map((t) => {
            const done = isDone(doneSet, t.id, today);
            const dueToday = occursOn(t.recurrence, today);
            const range = formatRange(t.startTime, t.durationMins);
            return (
              <div key={t.id} className={"list-row" + (done && dueToday ? " done" : "")}>
                {dueToday ? (
                  <Check on={done} onClick={() => toggleTaskDone(t.id, today)} />
                ) : (
                  <span className="check" style={{ opacity: 0.35 }} aria-hidden />
                )}
                <div className="body" onClick={() => setEditing(t)}>
                  <div className="title">{t.title}</div>
                  <div className="meta">
                    {describeRecurrence(t.recurrence)}
                    {dueToday ? " · due today" : ""}
                  </div>
                  <TaskNotes notes={t.notes} />
                </div>
                {range && <span className="chip time">🕐 {range}</span>}
                <button className="icon-btn" onClick={() => setEditing(t)}>
                  ✏️
                </button>
              </div>
            );
          })}
        </div>
      )}

      {creating && (
        <TaskEditor
          defaultList={list}
          onClose={() => setCreating(false)}
          onSave={(d) => {
            addTask(d);
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
    </div>
  );
}
