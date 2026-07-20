import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { NAV_ITEMS } from "../nav";
import { SyncBadge } from "./SyncBadge";

export function Layout() {
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = NAV_ITEMS.filter((n) => n.primary);
  const overflow = NAV_ITEMS.filter((n) => !n.primary);

  return (
    <div className="app">
      <SyncBadge />
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="dot" />
          gladna.joz
        </div>
        {NAV_ITEMS.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === "/"}>
            <span className="ic">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </aside>

      <div>
        <main className="app-main">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {primary.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === "/"}>
            <span className="ic">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
        <a
          href="#more"
          onClick={(e) => {
            e.preventDefault();
            setMoreOpen(true);
          }}
        >
          <span className="ic">⋯</span>
          More
        </a>
      </nav>

      {moreOpen && (
        <div className="sheet-backdrop" onClick={() => setMoreOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            {overflow.map((n) => (
              <NavLink key={n.to} to={n.to} onClick={() => setMoreOpen(false)}>
                <span className="ic">{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
