"use client";

import { useState } from "react";
import type { ConsumerScriptRequest } from "@/lib/claude";

export function CallScriptButton({ req }: { req: ConsumerScriptRequest }) {
  const [script, setScript] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-call-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      setScript(data.script ?? data.error ?? "Error generating script.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!script ? (
        <button
          onClick={generate}
          disabled={loading}
          className="w-full px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Generating script…" : "✦ Generate call script"}
        </button>
      ) : (
        <div className="mt-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              AI Call Script
            </span>
            <button
              onClick={() => setScript(null)}
              className="text-xs text-blue-400 hover:text-blue-700"
            >
              Regenerate
            </button>
          </div>
          <pre className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed font-sans">
            {script}
          </pre>
        </div>
      )}
    </div>
  );
}
