import { useState } from "react";
import { useApp } from "../state/AppContext";
import { Check } from "../components/Check";
import { Modal } from "../components/Modal";
import { Toolbar, FilterChips } from "../components/Toolbar";
import { SortableList, SortableItem } from "../components/Sortable";
import type { ListKind, Priority, ShoppingItem } from "../types";

const PRIORITY_CLASS: Record<Priority, string> = {
  high: "hi",
  medium: "mid",
  low: "lo",
};

type PriorityFilter = "all" | Priority;

export function Shopping() {
  const {
    data,
    loading,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    reorderShopping,
  } = useApp();
  const [list, setList] = useState<ListKind>("gladna.joz");
  const [newName, setNewName] = useState("");
  const [newWhere, setNewWhere] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [showDetails, setShowDetails] = useState(false);
  const [editing, setEditing] = useState<ShoppingItem | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

  if (loading) return <div className="center-screen">Loading…</div>;

  const q = search.trim().toLowerCase();
  const matches = (s: ShoppingItem) =>
    (priorityFilter === "all" || s.priority === priorityFilter) &&
    (!q ||
      s.name.toLowerCase().includes(q) ||
      (s.whereToFind ?? "").toLowerCase().includes(q) ||
      (s.note ?? "").toLowerCase().includes(q));

  const items = data.shoppingItems
    .filter((s) => s.list === list && matches(s))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const toBuy = items.filter((s) => !s.bought);
  const bought = items.filter((s) => s.bought);

  const add = () => {
    if (!newName.trim()) return;
    addShoppingItem({
      list,
      name: newName.trim(),
      priority: newPriority,
      whereToFind: newWhere.trim() || undefined,
      note: newNote.trim() || undefined,
    });
    setNewName("");
    setNewWhere("");
    setNewNote("");
    setNewPriority("medium");
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Shopping</h1>
          <div className="sub">{toBuy.length} to buy</div>
        </div>
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

      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="row">
          <input
            className="input"
            placeholder="Add item…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button className="btn primary" onClick={add}>
            Add
          </button>
        </div>
        <button
          className="btn ghost sm"
          style={{ marginTop: 8 }}
          onClick={() => setShowDetails((v) => !v)}
        >
          {showDetails ? "− Hide where & note" : "+ Where & note"}
        </button>
        {showDetails && (
          <div className="stack" style={{ marginTop: 8 }}>
            <div className="field">
              <label>Where to find</label>
              <input
                className="input"
                placeholder="e.g. Farmers market"
                value={newWhere}
                onChange={(e) => setNewWhere(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Note / link</label>
              <input
                className="input"
                placeholder="e.g. get the ripe ones"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Priority</label>
              <div className="segmented">
                {(["low", "medium", "high"] as Priority[]).map((p) => (
                  <button
                    key={p}
                    className={newPriority === p ? "active" : ""}
                    onClick={() => setNewPriority(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Toolbar search={search} onSearch={setSearch} placeholder="Search items…">
        <FilterChips
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            { value: "all", label: "All" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
        />
      </Toolbar>

      {toBuy.length === 0 ? (
        <div className="card pad empty">Nothing to buy on this list 🛒</div>
      ) : (
        <SortableList
          ids={toBuy.map((i) => i.id)}
          onReorder={(ordered) => {
            // Keep bought items after the reordered to-buy items.
            reorderShopping(list, [...ordered, ...bought.map((b) => b.id)]);
          }}
        >
          {toBuy.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {({ attributes, listeners }) => (
                <div className="list-row" style={{ marginBottom: 8 }}>
                  <span className="drag-handle" {...attributes} {...listeners}>
                    ⠿
                  </span>
                  <Check
                    on={item.bought}
                    onClick={() => updateShoppingItem(item.id, { bought: true })}
                  />
                  <div className="body" onClick={() => setEditing(item)}>
                    <div className="title">{item.name}</div>
                    {item.whereToFind && (
                      <div className="meta">📍 {item.whereToFind}</div>
                    )}
                    {item.note && <div className="meta">📝 {item.note}</div>}
                  </div>
                  <span className={"chip " + PRIORITY_CLASS[item.priority]}>
                    {item.priority}
                  </span>
                </div>
              )}
            </SortableItem>
          ))}
        </SortableList>
      )}

      {bought.length > 0 && (
        <>
          <div className="section-title">
            <span>Bought ({bought.length})</span>
          </div>
          {bought.map((item) => (
            <div key={item.id} className="list-row done">
              <Check
                on
                onClick={() => updateShoppingItem(item.id, { bought: false })}
              />
              <div className="body" onClick={() => setEditing(item)}>
                <div className="title">{item.name}</div>
              </div>
              <button className="icon-btn" onClick={() => deleteShoppingItem(item.id)}>
                🗑️
              </button>
            </div>
          ))}
        </>
      )}

      {editing && (
        <ShoppingEditor
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateShoppingItem(editing.id, patch);
            setEditing(null);
          }}
          onDelete={() => {
            deleteShoppingItem(editing.id);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ShoppingEditor({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  item: ShoppingItem;
  onClose: () => void;
  onSave: (patch: Partial<ShoppingItem>) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [priority, setPriority] = useState<Priority>(item.priority);
  const [whereToFind, setWhereToFind] = useState(item.whereToFind ?? "");
  const [note, setNote] = useState(item.note ?? "");

  return (
    <Modal title="Shopping item" onClose={onClose}>
      <div className="stack">
        <div className="field">
          <label>Item</label>
          <input
            className="input"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Priority</label>
          <div className="segmented">
            {(["low", "medium", "high"] as Priority[]).map((p) => (
              <button
                key={p}
                className={priority === p ? "active" : ""}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Where to find (optional)</label>
          <input
            className="input"
            value={whereToFind}
            placeholder="e.g. Farmers market"
            onChange={(e) => setWhereToFind(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Note / link (optional)</label>
          <input
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="row" style={{ marginTop: 6 }}>
          <button className="btn danger" onClick={onDelete}>
            Delete
          </button>
          <div className="spacer" />
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={() =>
              onSave({
                name: name.trim() || item.name,
                priority,
                whereToFind: whereToFind.trim() || undefined,
                note: note.trim() || undefined,
              })
            }
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
