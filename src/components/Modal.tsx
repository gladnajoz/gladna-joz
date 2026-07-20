import { useEffect, useState, type ReactNode } from "react";

export function Modal({
  title,
  onClose,
  children,
  dirty = false,
  onSave,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  // When `dirty` is true, closing (backdrop / ✕ / Esc) asks to save first.
  dirty?: boolean;
  onSave?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  // Attempt to close: if there are unsaved changes, ask first.
  const attemptClose = () => {
    if (dirty) setConfirming(true);
    else onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") attemptClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty]);

  return (
    <div className="modal-backdrop" onClick={attemptClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <div className="spacer" />
          <button className="icon-btn" onClick={attemptClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}

        {confirming && (
          <div className="confirm-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-card">
              <div className="confirm-title">Save your changes?</div>
              <div className="confirm-text">You have unsaved changes.</div>
              <div className="confirm-actions">
                {onSave && (
                  <button
                    className="btn primary"
                    onClick={() => {
                      setConfirming(false);
                      onSave();
                    }}
                  >
                    Save
                  </button>
                )}
                <button
                  className="btn danger"
                  onClick={() => {
                    setConfirming(false);
                    onClose();
                  }}
                >
                  Discard
                </button>
                <button className="btn ghost" onClick={() => setConfirming(false)}>
                  Keep editing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
