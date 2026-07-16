import { useState } from "react";
import { useApp } from "../state/AppContext";
import { FoodIdeaEditor } from "../components/FoodIdeaEditor";
import { Toolbar, FilterChips } from "../components/Toolbar";
import type { FoodIdea } from "../types";

type ContentFilter = "all" | "toMake" | "made" | "posted";

export function ContentChecklist() {
  const { data, loading, addFoodIdea, updateFoodIdea, deleteFoodIdea } = useApp();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<FoodIdea | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ContentFilter>("all");

  if (loading) return <div className="center-screen">Loading…</div>;

  const q = search.trim().toLowerCase();
  const ideas = data.foodIdeas
    .filter((f) => {
      if (filter === "toMake") return !f.made;
      if (filter === "made") return f.made && !f.posted;
      if (filter === "posted") return f.posted;
      return true;
    })
    .filter(
      (f) =>
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.source ?? "").toLowerCase().includes(q),
    );
  const add = () => {
    if (!newName.trim()) return;
    addFoodIdea(newName.trim());
    setNewName("");
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Content Checklist</h1>
          <div className="sub">Food ideas · made & posted</div>
        </div>
      </div>

      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="row">
          <input
            className="input"
            placeholder="New food idea…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button className="btn primary" onClick={add}>
            Add
          </button>
        </div>
      </div>

      <Toolbar search={search} onSearch={setSearch} placeholder="Search food ideas…">
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "toMake", label: "To make" },
            { value: "made", label: "Made" },
            { value: "posted", label: "Posted" },
          ]}
        />
      </Toolbar>

      {ideas.length === 0 ? (
        <div className="card pad empty">
          {q || filter !== "all" ? "No ideas match." : "No food ideas yet — add your first!"}
        </div>
      ) : (
        <div>
          {ideas.map((f) => (
            <div key={f.id} className="list-row">
              <div className="body" onClick={() => setEditing(f)}>
                <div className="title">{f.name}</div>
                <div className="meta">
                  {f.source ? `from ${f.source}` : " "}
                  {f.written ? " · recipe ✓" : ""}
                </div>
              </div>
              <button
                className={"btn sm" + (f.made ? " primary" : "")}
                onClick={() => updateFoodIdea(f.id, { made: !f.made })}
              >
                {f.made ? "✓ Made" : "Made"}
              </button>
              <button
                className={"btn sm" + (f.posted ? " primary" : "")}
                onClick={() => updateFoodIdea(f.id, { posted: !f.posted })}
              >
                {f.posted ? "✓ Posted" : "Posted"}
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <FoodIdeaEditor
          idea={editing}
          focus="content"
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
