// Renders a task's notes as bullet points (one per non-empty line).
export function TaskNotes({ notes }: { notes?: string }) {
  const lines = (notes ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <ul className="task-notes">
      {lines.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}
