"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OUTCOMES = ["PITCH_PRESENTED","FOLLOW_UP_SCHEDULED","OBJECTION_RAISED","DEAL_PROGRESSED","NO_DECISION"] as const;
const CHANNELS = ["OUTBOUND_CALL","INBOUND_CALL","EMAIL","IN_PERSON"] as const;

export function LogInteractionButton({
  accountId,
  bundleName,
}: {
  accountId: string;
  bundleName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<string>("PITCH_PRESENTED");
  const [channel, setChannel] = useState<string>("OUTBOUND_CALL");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/log-interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: accountId,
          customer_type: "ENTERPRISE",
          agent_id: "agent.current",
          channel,
          nba_offer_presented: bundleName,
          nba_outcome: outcome,
          call_script_used: false,
          notes,
        }),
      });
      setSaved(true);
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
        ✓ Interaction logged
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full px-4 py-2 rounded-md border bg-card hover:bg-muted text-sm"
        >
          Log interaction
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2 mt-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full border rounded-md px-2 py-1.5 text-xs mt-0.5"
              >
                {CHANNELS.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Outcome</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full border rounded-md px-2 py-1.5 text-xs mt-0.5"
              >
                {OUTCOMES.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
              </select>
            </div>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)…"
            rows={2}
            className="w-full border rounded-md px-2 py-1.5 text-xs resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 border rounded-md text-xs">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
