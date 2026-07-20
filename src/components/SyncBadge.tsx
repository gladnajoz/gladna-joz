import { isCloudActive } from "../lib/storage";

// Tiny status pill so you can always tell whether the app is talking to the
// cloud (synced across devices) or only saving on this device.
export function SyncBadge() {
  const cloud = isCloudActive();
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
      {cloud ? "☁ Synced" : "⚠ This device only"}
    </div>
  );
}
