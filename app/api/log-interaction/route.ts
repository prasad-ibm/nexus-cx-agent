import { NextResponse } from "next/server";
import { logInteraction } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.customer_type || !body.agent_id || !body.channel) {
      return NextResponse.json({ error: "customer_type, agent_id, and channel are required" }, { status: 400 });
    }
    const interaction_id = await logInteraction(body);
    return NextResponse.json({ ok: true, interaction_id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
