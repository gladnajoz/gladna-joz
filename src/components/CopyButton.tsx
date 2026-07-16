import { useState } from "react";

// Copies text to the clipboard and shows brief "Copied!" feedback.
export function CopyButton({
  text,
  label = "Copy full caption",
  className = "btn primary",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for insecure contexts / older browsers.
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button className={className} onClick={copy}>
      {copied ? "✓ Copied!" : `📋 ${label}`}
    </button>
  );
}
