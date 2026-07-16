import type { ReactNode } from "react";

// Search box + a row of filter controls, used across list screens.
export function Toolbar({
  search,
  onSearch,
  placeholder = "Search…",
  children,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  children?: ReactNode;
}) {
  return (
    <div className="toolbar">
      <div className="search">
        <span className="search-ic">🔍</span>
        <input
          className="search-input"
          value={search}
          placeholder={placeholder}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button
            className="search-clear"
            onClick={() => onSearch("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      {children && <div className="filter-chips">{children}</div>}
    </div>
  );
}

// A single-select group of filter chips.
export function FilterChips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <>
      {options.map((o) => (
        <button
          key={o.value}
          className={"fchip" + (value === o.value ? " on" : "")}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </>
  );
}
