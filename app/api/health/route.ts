export const runtime = "nodejs";

export async function GET() {
  return Response.json({ ok: true, service: "telco-cx-agent", ts: new Date().toISOString() });
}
