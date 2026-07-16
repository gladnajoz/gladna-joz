// Round check toggle used across task and shopping rows.
export function Check({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      className={"check" + (on ? " on" : "")}
      onClick={onClick}
      aria-pressed={on}
      aria-label={label ?? (on ? "Mark not done" : "Mark done")}
    >
      ✓
    </button>
  );
}
