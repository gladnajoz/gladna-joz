import { useState, type ReactNode } from "react";

// Simple passcode gate. Activated by setting VITE_APP_PIN (env var). When set,
// visitors must enter it before the app loads; once correct it's remembered on
// that device. If VITE_APP_PIN is empty/unset, the app is open (no gate).
//
// Note: this is a lightweight "keep strangers out" lock, not bank-grade
// security — the check runs in the browser. Good enough for a private tool.
const PIN = import.meta.env.VITE_APP_PIN?.trim();
const REMEMBER_KEY = "gladna-unlock";

export function PasscodeGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(
    () => !PIN || localStorage.getItem(REMEMBER_KEY) === PIN,
  );
  const [entry, setEntry] = useState("");
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  const submit = () => {
    if (entry === PIN) {
      localStorage.setItem(REMEMBER_KEY, PIN);
      setUnlocked(true);
    } else {
      setError(true);
      setEntry("");
    }
  };

  return (
    <div className="lock-screen">
      <div className="lock-card">
        <div className="lock-mark">🥣</div>
        <div className="brand" style={{ justifyContent: "center" }}>
          <span className="dot" />
          gladna.joz
        </div>
        <p className="lock-hint">Enter your passcode to continue</p>
        <input
          className="input"
          type="password"
          inputMode="numeric"
          autoFocus
          value={entry}
          placeholder="••••"
          style={{ textAlign: "center", letterSpacing: "0.4em", fontSize: "1.2rem" }}
          onChange={(e) => {
            setEntry(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {error && <div className="lock-error">Wrong passcode — try again</div>}
        <button className="btn primary block" onClick={submit}>
          Unlock
        </button>
      </div>
    </div>
  );
}
