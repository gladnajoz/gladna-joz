import { Link } from "react-router-dom";
import { useApp } from "../state/AppContext";
import { Check } from "../components/Check";
import { TaskNotes } from "../components/TaskNotes";
import { todayISO, formatLong } from "../lib/date";
import { formatRange } from "../lib/time";
import { tasksForDate, isDone, makeCompletionSet } from "../lib/recurrence";

export function Dashboard() {
  const { data, loading, toggleTaskDone } = useApp();
  const today = todayISO();

  if (loading) return <div className="center-screen">Loading…</div>;

  const doneSet = makeCompletionSet(data.completions);
  // Timed tasks first (by start time), then untimed.
  const byTime = (a: (typeof data.tasks)[number], b: (typeof data.tasks)[number]) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return 0;
  };
  const todays = tasksForDate(data.tasks, today).sort(byTime);
  const jozTasks = todays.filter((t) => t.list === "gladna.joz");
  const personalTasks = todays.filter((t) => t.list === "personal");

  const calDay = data.calendarDays.find((c) => c.date === today);
  const linkedFood = calDay?.foodIdeaId
    ? data.foodIdeas.find((f) => f.id === calDay.foodIdeaId)
    : undefined;

  const unbought = data.shoppingItems.filter((s) => !s.bought).length;
  const remaining = todays.filter((t) => !isDone(doneSet, t.id, today)).length;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Today</h1>
          <div className="sub">{formatLong(today)}</div>
        </div>
      </div>

      <div className="tiles">
        <div className="tile">
          <div className="n">{remaining}</div>
          <div className="l">Tasks left</div>
        </div>
        <Link to="/shopping" className="tile">
          <div className="n">{unbought}</div>
          <div className="l">To buy</div>
        </Link>
        <Link to="/calendar" className="tile">
          <div className="n">{linkedFood ? "🍽️" : "—"}</div>
          <div className="l">Today's plan</div>
        </Link>
      </div>

      <div className="section-title">
        <span>gladna.joz · today</span>
        <Link to="/tasks" className="link-strong" style={{ fontSize: "0.8rem" }}>
          All tasks →
        </Link>
      </div>
      {jozTasks.length === 0 ? (
        <div className="card pad empty">Nothing for gladna.joz today 🎉</div>
      ) : (
        <div>
          {jozTasks.map((t) => {
            const done = isDone(doneSet, t.id, today);
            return (
              <div key={t.id} className={"list-row" + (done ? " done" : "")}>
                <Check on={done} onClick={() => toggleTaskDone(t.id, today)} />
                <div className="body">
                  <div className="title">{t.title}</div>
                  {formatRange(t.startTime, t.durationMins) && (
                    <div className="meta">🕐 {formatRange(t.startTime, t.durationMins)}</div>
                  )}
                  <TaskNotes notes={t.notes} />
                </div>
                <span className="chip joz">gladna.joz</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="section-title">
        <span>Personal · today</span>
      </div>
      {personalTasks.length === 0 ? (
        <div className="card pad empty">Nothing personal today ✨</div>
      ) : (
        <div>
          {personalTasks.map((t) => {
            const done = isDone(doneSet, t.id, today);
            return (
              <div key={t.id} className={"list-row" + (done ? " done" : "")}>
                <Check on={done} onClick={() => toggleTaskDone(t.id, today)} />
                <div className="body">
                  <div className="title">{t.title}</div>
                  {formatRange(t.startTime, t.durationMins) && (
                    <div className="meta">🕐 {formatRange(t.startTime, t.durationMins)}</div>
                  )}
                  <TaskNotes notes={t.notes} />
                </div>
                <span className="chip personal">Personal</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="section-title">
        <span>Today's plan</span>
        <Link to="/calendar" className="link-strong" style={{ fontSize: "0.8rem" }}>
          Open →
        </Link>
      </div>
      <div className="card pad">
        {linkedFood ? (
          <div className="row">
            <span style={{ fontSize: "1.4rem" }}>🍽️</span>
            <div className="body">
              <div className="title" style={{ fontWeight: 700 }}>
                {linkedFood.name}
              </div>
              <div className="meta">Linked food idea for today</div>
            </div>
          </div>
        ) : (
          <div className="muted" style={{ fontSize: "0.9rem" }}>
            No food idea linked to today.
          </div>
        )}
        {calDay?.storyTopics ? (
          <>
            <hr className="divider" />
            <div className="meta" style={{ marginBottom: 4 }}>
              Story topics
            </div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: "0.92rem" }}>
              {calDay.storyTopics}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
