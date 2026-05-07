import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    await pool.query("SELECT 1");
    return Response.json({ ok: true, service: "telco-cx-agent", db: "connected", ts: new Date().toISOString() });
  } catch {
    return Response.json({ ok: false, db: "unreachable" }, { status: 503 });
  }
}
