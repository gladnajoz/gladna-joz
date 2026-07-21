import { useApp } from "../state/AppContext";

// Tiny status pill so you can always tell whether the app is talking to the
// cloud (synced across devices) or only saving on this device — and, when
// synced, roughly when it last reached the cloud, so live syncing is visible.
export function SyncBadge() {
  const { cloud, lastSyncedAt } = useApp();

  const when =
    cloud && lastSyncedAt
      ? new Date(lastSyncedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <div
      className="sync-badge"
      style={{
        background: cloud ? "var(--brand-soft)" : "#fdecd6",
        color: cloud ? "var(--brand)" : "#8a5a12",
        borderColor: cloud ? "var(--sage)" : "#e8c27a",
      }}
      title={
        cloud
          ? "Synced to the cloud — changes appear on all your devices"
          : "Saving on this device only — not syncing"
      }
    >
      {cloud ? (when ? `☁ Synced · ${when}` : "☁ Synced") : "⚠ This device only"}
    </div>
  );
}
