import { useState } from "react";

// ⚠️ TEMPORARY JOKE OVERLAY — remove when the prank is done.
// Full-screen alarm that covers the whole app. Self-contained (this file + one
// line in main.tsx). To remove: delete <PrankOverlay /> from main.tsx and this file.
export function PrankOverlay() {
  const [taunt, setTaunt] = useState("");
  const taunts = [
    "❌ NICE TRY.",
    "🧊 RESTOCK THE ICE FIRST.",
    "🚫 THAT BUTTON DOESN'T WORK.",
    "😤 THE FREEZER IS EMPTY. SO IS YOUR LUCK.",
    "⛔ APP LOCKED. ICE REQUIRED.",
  ];

  return (
    <div className="prank-root">
      <style>{`
        .prank-root {
          position: fixed; inset: 0; z-index: 2147483647;
          background: #0a0000;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 24px;
          overflow: hidden;
          animation: prankFlash 0.7s steps(1) infinite;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          user-select: none;
        }
        @keyframes prankFlash {
          0%, 100% { background: #0a0000; }
          50% { background: #200000; }
        }
        .prank-siren { font-size: clamp(2.5rem, 9vw, 5rem); animation: prankShake 0.35s infinite; }
        @keyframes prankShake {
          0%,100% { transform: translateX(0) rotate(0); }
          25% { transform: translateX(-8px) rotate(-6deg); }
          75% { transform: translateX(8px) rotate(6deg); }
        }
        .prank-big {
          font-weight: 900;
          color: #ff1e1e;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          line-height: 0.95;
          font-size: clamp(3.5rem, 20vw, 11rem);
          text-shadow: 0 0 18px rgba(255,20,20,0.85), 0 0 40px rgba(255,0,0,0.5);
          animation: prankPulse 0.6s ease-in-out infinite alternate;
          margin: 0;
        }
        @keyframes prankPulse {
          from { transform: scale(1); opacity: 0.92; }
          to   { transform: scale(1.06); opacity: 1; }
        }
        .prank-sub {
          margin-top: 22px;
          color: #ffd0d0;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: clamp(0.8rem, 3.5vw, 1.15rem);
        }
        .prank-band {
          margin-top: 10px;
          color: #ff6b6b;
          font-size: clamp(0.7rem, 3vw, 0.95rem);
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .prank-btn {
          margin-top: 34px;
          background: #ff1e1e; color: #0a0000;
          border: none; border-radius: 8px;
          font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em;
          padding: 14px 26px; font-size: 1rem; cursor: not-allowed;
        }
        .prank-taunt {
          margin-top: 16px; min-height: 24px;
          color: #fff; font-weight: 800; letter-spacing: 0.06em;
          font-size: clamp(0.85rem, 3.5vw, 1.1rem);
        }
        @media (prefers-reduced-motion: reduce) {
          .prank-root, .prank-siren, .prank-big { animation: none; }
        }
      `}</style>

      <div className="prank-siren">🚨🧊🚨</div>
      <h1 className="prank-big">NO&nbsp;ICE</h1>
      <h1 className="prank-big">NO&nbsp;APP</h1>
      <div className="prank-sub">❄️ Freezer compliance violation ❄️</div>
      <div className="prank-band">Access denied until ice cubes are restocked</div>

      <button
        className="prank-btn"
        onClick={() => setTaunt(taunts[Math.floor(Math.random() * taunts.length)])}
      >
        Dismiss
      </button>
      <div className="prank-taunt">{taunt}</div>
    </div>
  );
}
