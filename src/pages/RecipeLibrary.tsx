import { useState } from "react";
import { useApp } from "../state/AppContext";
import { FoodIdeaEditor } from "../components/FoodIdeaEditor";
import { Toolbar, FilterChips } from "../components/Toolbar";
import { CopyButton } from "../components/CopyButton";
import type { FoodIdea } from "../types";
import { buildCaption } from "../lib/caption";
import "./recipe-garden.css";

type RecipeFilter = "all" | "written" | "toWrite";

const CAPTION_LIMIT = 2200; // Instagram caption character limit

export function RecipeLibrary() {
  const { data, loading, updateFoodIdea, deleteFoodIdea } = useApp();
  const [editing, setEditing] = useState<FoodIdea | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RecipeFilter>("all");

  if (loading) return <div className="center-screen">Loading…</div>;

  const q = search.trim().toLowerCase();
  const matches = (f: FoodIdea) =>
    !q ||
    f.name.toLowerCase().includes(q) ||
    (f.source ?? "").toLowerCase().includes(q);

  const written = data.foodIdeas.filter((f) => f.written && matches(f));
  const unwritten = data.foodIdeas.filter((f) => !f.written && matches(f));
  const showWritten = filter === "all" || filter === "written";
  const showToWrite = filter === "all" || filter === "toWrite";

  return (
    <div className="garden">
      <header className="g-masthead">
        <div className="g-eyebrow">gladna.joz · kuvar</div>
        <h1 className="g-title">The Cookbook</h1>
        <div className="g-sub">
          {written.length} written · {unwritten.length} to write · tap a recipe to copy
          its caption
        </div>
      </header>

      <Toolbar search={search} onSearch={setSearch} placeholder="Search recipes…">
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "written", label: "Written" },
            { value: "toWrite", label: "To write" },
          ]}
        />
      </Toolbar>

      {showWritten && (
        <>
          <div className="g-rule">
            <span className="lbl">Written</span>
            <span className="line" />
            <span className="count">{String(written.length).padStart(2, "0")}</span>
          </div>
          {written.length === 0 ? (
            <div className="rc" style={{ padding: 22 }}>
              <div className="empty">
                {q ? "No written recipes match." : "No recipes written yet."}
              </div>
            </div>
          ) : (
            written.map((f) => {
              const open = expanded === f.id;
              const caption = buildCaption(f);
              const over = caption.length > CAPTION_LIMIT;
              return (
                <div key={f.id} className="rc">
                  <div className="rc-head">
                    <div
                      className="rc-main"
                      onClick={() => setExpanded(open ? null : f.id)}
                    >
                      <div className="rc-eyebrow">
                        {f.source ? `od ${f.source}` : "original"}
                      </div>
                      <div className="rc-title">{f.name}</div>
                      <div className="rc-states">
                        <span className={"rc-state made" + (f.made ? " on" : "")}>
                          {f.made ? "✓ made" : "made"}
                        </span>
                        <span className={"rc-state posted" + (f.posted ? " on" : "")}>
                          {f.posted ? "✓ posted" : "posted"}
                        </span>
                      </div>
                    </div>
                    <div className="rc-actions">
                      <CopyButton text={caption} label="Copy" className="btn" />
                      <button className="icon-btn" onClick={() => setEditing(f)}>
                        ✏️
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => setExpanded(open ? null : f.id)}
                        aria-label={open ? "Collapse" : "Expand"}
                      >
                        {open ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="cap-card">
                      <div className="cap-head">
                        <span className="k">Opis za Instagram</span>
                        <span className={"cap-count" + (over ? " over" : "")}>
                          {caption.length} / {CAPTION_LIMIT}
                        </span>
                      </div>
                      <div className="cap-body">{caption}</div>
                      <div className="cap-actions">
                        <CopyButton text={caption} />
                        <button className="btn" onClick={() => setEditing(f)}>
                          Edit sections
                        </button>
                      </div>
                      {f.notes && (
                        <div style={{ padding: "0 16px 14px" }}>
                          <div className="rc-eyebrow" style={{ marginBottom: 4 }}>
                            private notes · not copied
                          </div>
                          <div style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
                            {f.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}

      {showToWrite && (
        <>
          <div className="g-rule">
            <span className="lbl">To write</span>
            <span className="line" />
            <span className="count">{String(unwritten.length).padStart(2, "0")}</span>
          </div>
          {unwritten.length === 0 ? (
            <div className="tw">
              <div className="empty">All caught up ✍️</div>
            </div>
          ) : (
            unwritten.map((f) => (
              <div key={f.id} className="tw">
                <div className="body" onClick={() => setEditing(f)}>
                  <div className="t">{f.name}</div>
                  <div className="m">{f.source ? `od ${f.source}` : "original"}</div>
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    updateFoodIdea(f.id, { written: true });
                    setEditing(f);
                  }}
                >
                  Write recipe
                </button>
              </div>
            ))
          )}
        </>
      )}

      {editing && (
        <FoodIdeaEditor
          idea={editing}
          focus="recipe"
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateFoodIdea(editing.id, patch);
            setEditing(null);
          }}
          onDelete={() => {
            deleteFoodIdea(editing.id);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
