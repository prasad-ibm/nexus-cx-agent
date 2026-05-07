"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OUTCOMES = ["ACCEPTED","DEFERRED","REJECTED","ESCALATED"] as const;
const CHANNELS = ["INBOUND_CALL","OUTBOUND_CALL","CHAT","EMAIL"] as const;

export function LogInteractionButton({
  customerId,
  nbaOffer,
  scriptGenerated,
}: {
  customerId: string;
  nbaOffer: string;
  scriptGenerated: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<string>("ACCEPTED");
  const [channel, setChannel] = useState<string>("INBOUND_CALL");
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
          customer_id: customerId,
          customer_type: "CONSUMER",
          agent_id: "agent.current",
          channel,
          nba_offer_presented: nbaOffer,
          nba_outcome: outcome,
          call_script_used: scriptGenerated,
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
          className="w-full px-4 py-2 rounded-md border bg-card hover:bg-slate-50 text-sm"
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
                {CHANNELS.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Outcome</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full border rounded-md px-2 py-1.5 text-xs mt-0.5"
              >
                {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
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
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 border rounded-md text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
