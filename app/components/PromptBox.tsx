"use client";

import { useState } from "react";

export function PromptBox({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(text); } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className="promptbox">
      <div className="pb-head">
        <span>Prompt to start from</span>
        <button onClick={copy}>{copied ? "Copied" : "Copy"}</button>
      </div>
      <code>{text}</code>
    </div>
  );
}
