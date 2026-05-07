export const dynamic = "force-dynamic";

import { searchConsumers, searchEnterprises, getLandingStats } from "@/lib/db";
import { fmtZAR, churnColor, churnLabel, urgencyColor, healthColor } from "@/lib/format";
import Link from "next/link";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const type = sp.type === "enterprise" ? "enterprise" : "consumer";

  const stats = await getLandingStats();

  const consumers   = q && type === "consumer"   ? await searchConsumers(q)   : [];
  const enterprises = q && type === "enterprise" ? await searchEnterprises(q) : [];

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="mb-8 mt-4">
        <h1 className="text-2xl font-semibold tracking-tight">Customer Lookup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search by name, MSISDN, customer ID, or account name to pull up a full 360 profile.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">Consumer customers</div>
          <div className="text-2xl font-semibold mt-1">{parseInt(stats.total_consumers).toLocaleString()}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">High churn risk</div>
          <div className="text-2xl font-semibold mt-1 text-red-600">{parseInt(stats.high_churn_count).toLocaleString()}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">Enterprise accounts</div>
          <div className="text-2xl font-semibold mt-1">{parseInt(stats.total_enterprises).toLocaleString()}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">Urgent upsell opportunities</div>
          <div className="text-2xl font-semibold mt-1 text-amber-600">{parseInt(stats.urgent_upsell_count).toLocaleString()}</div>
        </div>
      </div>

      {/* Search form */}
      <div className="rounded-lg border bg-card p-6 mb-8">
        <form method="GET" className="flex flex-col gap-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {(["consumer", "enterprise"] as const).map((t) => (
              <button
                key={t}
                type="submit"
                name="type"
                value={t}
                formAction="/"
                className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
                  type === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-slate-50"
                }`}
              >
                {t === "consumer" ? "👤 Consumer" : "🏢 Enterprise"}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              name="q"
              defaultValue={q}
              autoFocus
              placeholder={
                type === "consumer"
                  ? "Name, MSISDN (e.g. 27821001001), or customer ID…"
                  : "Company name or account ID (e.g. ACC-001)…"
              }
              className="flex-1 border rounded-md px-3 py-2 text-sm"
            />
            <input type="hidden" name="type" value={type} />
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90"
            >
              Search
            </button>
            {q && (
              <Link href="/" className="text-sm text-muted-foreground self-center hover:underline">
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Consumer results */}
      {type === "consumer" && q && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-slate-50 text-sm font-medium">
            Consumer results — {consumers.length} found
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b text-left">
              <tr>
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">MSISDN</th>
                <th className="px-4 py-2.5 font-medium">Plan</th>
                <th className="px-4 py-2.5 font-medium text-right">Fee/month</th>
                <th className="px-4 py-2.5 font-medium">Province</th>
                <th className="px-4 py-2.5 font-medium">Segment</th>
                <th className="px-4 py-2.5 font-medium">Churn risk</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {consumers.map((c) => (
                <tr key={c.customer_id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{c.full_name}</div>
                    <div className="text-xs text-muted-foreground">{c.customer_id}</div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">{c.msisdn}</td>
                  <td className="px-4 py-2.5 text-xs">
                    <div>{c.plan_name}</div>
                    <div className="text-muted-foreground">{c.contract_type}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm">{fmtZAR(c.monthly_plan_fee)}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{c.province}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{c.segment_label ?? "—"}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${churnColor(c.churn_risk_score)}`}>
                      {churnLabel(c.churn_risk_score)} {c.churn_risk_score ? `(${(parseFloat(c.churn_risk_score) * 100).toFixed(0)}%)` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/consumer/${c.customer_id}`} className="text-sm text-primary hover:underline font-medium">
                      View 360 →
                    </Link>
                  </td>
                </tr>
              ))}
              {consumers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No consumer customers match "{q}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Enterprise results */}
      {type === "enterprise" && q && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-slate-50 text-sm font-medium">
            Enterprise results — {enterprises.length} found
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b text-left">
              <tr>
                <th className="px-4 py-2.5 font-medium">Account</th>
                <th className="px-4 py-2.5 font-medium">Industry</th>
                <th className="px-4 py-2.5 font-medium text-right">ACV</th>
                <th className="px-4 py-2.5 font-medium">Province</th>
                <th className="px-4 py-2.5 font-medium">Renewal</th>
                <th className="px-4 py-2.5 font-medium">Urgency</th>
                <th className="px-4 py-2.5 font-medium">O2C Health</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {enterprises.map((e) => (
                <tr key={e.account_id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{e.account_name}</div>
                    <div className="text-xs text-muted-foreground">{e.account_id}</div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{e.industry_label}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{fmtZAR(e.contract_annual_value)}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{e.billing_province}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {e.months_to_renewal ? `${e.months_to_renewal}mo` : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${urgencyColor(e.urgency)}`}>
                      {e.urgency ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${healthColor(e.health_label)}`}>
                      {e.health_label ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/enterprise/${e.account_id}`} className="text-sm text-primary hover:underline font-medium">
                      View 360 →
                    </Link>
                  </td>
                </tr>
              ))}
              {enterprises.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No enterprise accounts match "{q}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
