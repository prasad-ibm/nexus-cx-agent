export const dynamic = "force-dynamic";

import { getEnterprise360 } from "@/lib/db";
import { fmtZAR, fmtDate, healthColor, urgencyColor, renewalUrgency } from "@/lib/format";
import { notFound } from "next/navigation";
import { BundlePitchButton } from "./BundlePitchButton";
import { LogInteractionButton } from "./LogInteractionButton";

const GAP_META = [
  { key: "gap_5g_upgrade",       label: "5G SIM upgrade",    has: "has_5g_sims" },
  { key: "gap_network_slice",    label: "Network slice",     has: "has_network_slice" },
  { key: "gap_managed_security", label: "Managed security",  has: "has_managed_security" },
  { key: "gap_iot_platform",     label: "IoT platform",      has: "has_iot" },
  { key: "gap_sdwan",            label: "SD-WAN",            has: "has_sdwan" },
] as const;

export default async function EnterprisePage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const { profile: p, interactions } = await getEnterprise360(accountId);
  if (!p) notFound();

  const products: Array<{ product_id: string; name: string; qty: number }> =
    Array.isArray(p.recommended_products) ? p.recommended_products : [];

  const pitchReq = {
    account_name: p.account_name,
    industry_label: p.industry_label,
    bundle_name: p.bundle_name ?? "",
    bundle_rationale: p.bundle_rationale ?? "",
    recommended_products: products.map((pr) => ({ name: pr.name, qty: pr.qty })),
    estimated_arr_zar: parseFloat(p.estimated_arr_zar ?? "0"),
    uplift_vs_current_pct: parseFloat(p.uplift_vs_current_pct ?? "0"),
    months_to_renewal: p.months_to_renewal ?? 0,
    urgency: p.urgency ?? "MEDIUM",
    gap_5g_upgrade: p.gap_5g_upgrade ?? false,
    gap_network_slice: p.gap_network_slice ?? false,
    gap_managed_security: p.gap_managed_security ?? false,
    gap_iot_platform: p.gap_iot_platform ?? false,
    gap_sdwan: p.gap_sdwan ?? false,
    health_label: p.health_label ?? "HEALTHY",
    credit_risk_flag: p.credit_risk_flag ?? false,
    avg_nps: parseFloat(p.avg_nps ?? "50"),
  };

  return (
    <div className="p-6 max-w-[1300px] mx-auto">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-4">
        <a href="/" className="hover:underline">Search</a>
        <span className="mx-1.5">›</span>
        <span>Enterprise</span>
        <span className="mx-1.5">›</span>
        <span>{p.account_name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{p.account_name}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">{p.industry_label}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{p.billing_province}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{p.employee_count?.toLocaleString()} employees</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">AM: {p.account_manager}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${renewalUrgency(p.months_to_renewal)}`}>
              {p.months_to_renewal}mo to renewal
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Contract: {fmtDate(p.contract_start)} → {fmtDate(p.contract_end)} · ACV {fmtZAR(p.contract_annual_value)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1.5 rounded border font-semibold ${urgencyColor(p.urgency)}`}>
            {p.urgency} urgency
          </span>
          <span className={`text-xs px-2.5 py-1.5 rounded border font-semibold ${healthColor(p.health_label)}`}>
            {p.health_label}
          </span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4 mb-7">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">Annual contract value</div>
          <div className="text-xl font-semibold mt-1">{fmtZAR(p.contract_annual_value)}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">Bundle ARR potential</div>
          <div className="text-xl font-semibold mt-1 text-blue-700">{fmtZAR(p.estimated_arr_zar)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">+{parseFloat(p.uplift_vs_current_pct ?? "0").toFixed(0)}% uplift</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">O2C health score</div>
          <div className={`text-xl font-semibold mt-1 ${parseFloat(p.o2c_health_score) >= 0.8 ? "text-green-600" : parseFloat(p.o2c_health_score) >= 0.6 ? "text-amber-600" : "text-red-600"}`}>
            {parseFloat(p.o2c_health_score ?? "0").toFixed(2)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">DSO days</div>
          <div className={`text-xl font-semibold mt-1 ${parseFloat(p.dso_days) > 60 ? "text-red-600" : parseFloat(p.dso_days) > 30 ? "text-amber-600" : ""}`}>
            {p.dso_days ? `${parseFloat(p.dso_days).toFixed(0)}d` : "—"}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">Avg NPS</div>
          <div className={`text-xl font-semibold mt-1 ${parseFloat(p.avg_nps) >= 50 ? "text-green-600" : parseFloat(p.avg_nps) >= 0 ? "text-amber-600" : "text-red-600"}`}>
            {p.avg_nps ?? "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="col-span-2 space-y-5">
          {/* Product gaps */}
          <div className="rounded-lg border bg-card p-5">
            <div className="text-sm font-medium mb-4">Product coverage & gaps</div>
            <div className="grid grid-cols-5 gap-2">
              {GAP_META.map(({ key, label, has }) => {
                const hasIt = p[has] as boolean;
                const gapExists = p[key] as boolean;
                return (
                  <div
                    key={key}
                    className={`rounded-lg border p-3 text-center text-xs ${
                      hasIt
                        ? "bg-green-50 border-green-200 text-green-800"
                        : gapExists
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-muted border text-muted-foreground"
                    }`}
                  >
                    <div className="text-lg mb-1">{hasIt ? "✓" : gapExists ? "⚠" : "—"}</div>
                    <div className="font-medium leading-tight">{label}</div>
                    <div className="text-[10px] mt-0.5 opacity-75">
                      {hasIt ? "Active" : gapExists ? "Gap" : "N/A"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bundle recommendation */}
          {p.bundle_name && (
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-medium">{p.bundle_name}</div>
                  <div className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                    {p.bundle_rationale}
                  </div>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <div className="text-xs text-muted-foreground">Est. MRR</div>
                  <div className="text-lg font-semibold text-blue-700">{fmtZAR(p.estimated_mrr_zar)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Bundle fit: {parseFloat(p.bundle_fit_score ?? "0").toFixed(2)}</div>
                </div>
              </div>
              {products.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Recommended products</div>
                  <div className="grid grid-cols-2 gap-2">
                    {products.map((pr) => (
                      <div key={pr.product_id} className="flex items-center gap-2 text-xs bg-muted rounded-md px-3 py-2">
                        <span className="font-mono text-muted-foreground">{pr.product_id}</span>
                        <span className="flex-1">{pr.name}</span>
                        <span className="font-semibold">× {pr.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Finance health */}
          <div className="rounded-lg border bg-card p-5">
            <div className="text-sm font-medium mb-3">Finance & O2C health</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Outstanding AR</dt>
                    <dd className={`font-medium ${parseFloat(p.outstanding_ar_zar) > 0 ? "text-amber-600" : ""}`}>
                      {fmtZAR(p.outstanding_ar_zar)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Overdue</dt>
                    <dd className={`font-medium ${parseFloat(p.overdue_value_zar) > 0 ? "text-red-600" : ""}`}>
                      {fmtZAR(p.overdue_value_zar)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Expected cash (30d)</dt>
                    <dd>{fmtZAR(p.expected_cash_30d_zar)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Expected cash (60d)</dt>
                    <dd>{fmtZAR(p.expected_cash_60d_zar)}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Revenue leakage</dt>
                    <dd>{p.revenue_leakage_flag
                      ? <span className="text-red-600 font-medium">⚠ Yes</span>
                      : "No"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Credit risk flag</dt>
                    <dd>{p.credit_risk_flag
                      ? <span className="text-red-600 font-medium">⚠ Yes</span>
                      : "No"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Provisioning risk</dt>
                    <dd>{p.provisioning_risk_flag
                      ? <span className="text-amber-600 font-medium">⚠ Yes</span>
                      : "No"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">SLA breaches (6m)</dt>
                    <dd className={`font-medium ${p.sla_breach_count_6m > 0 ? "text-orange-600" : ""}`}>
                      {p.sla_breach_count_6m ?? 0}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Interaction history */}
          {interactions.length > 0 && (
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted text-sm font-medium">Interaction history</div>
              <table className="w-full text-sm">
                <thead className="bg-muted border-b text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium text-xs">Date</th>
                    <th className="px-4 py-2 font-medium text-xs">Channel</th>
                    <th className="px-4 py-2 font-medium text-xs">Offer presented</th>
                    <th className="px-4 py-2 font-medium text-xs">Outcome</th>
                    <th className="px-4 py-2 font-medium text-xs">Agent</th>
                    <th className="px-4 py-2 font-medium text-xs">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {interactions.map((i: any) => (
                    <tr key={i.interaction_id} className="border-b hover:bg-muted">
                      <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(i.created_at)}</td>
                      <td className="px-4 py-2 text-xs">{i.channel}</td>
                      <td className="px-4 py-2 text-xs max-w-[180px] truncate">{i.nba_offer_presented ?? "—"}</td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          i.nba_outcome === "DEAL_PROGRESSED"     ? "bg-green-50 text-green-700" :
                          i.nba_outcome === "FOLLOW_UP_SCHEDULED" ? "bg-blue-50 text-blue-700"  :
                          i.nba_outcome === "OBJECTION_RAISED"    ? "bg-orange-50 text-orange-700" :
                          "bg-muted text-muted-foreground"
                        }`}>{i.nba_outcome?.replace(/_/g, " ") ?? "—"}</span>
                      </td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{i.agent_id}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground max-w-[160px] truncate">{i.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1/3 */}
        <div className="space-y-4">
          {/* Telemetry snapshot */}
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium mb-3">Account telemetry</div>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Active SIMs</dt>
                <dd className="font-medium">{p.active_sim_count?.toLocaleString() ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">IoT SIMs</dt>
                <dd className="font-medium">{p.active_iot_sim_count?.toLocaleString() ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Avg data/month</dt>
                <dd className="font-medium">{p.avg_monthly_data_gb ?? "—"} GB</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Data growth rate</dt>
                <dd className={`font-medium ${parseFloat(p.data_growth_rate_pct) > 15 ? "text-blue-600" : ""}`}>
                  {p.data_growth_rate_pct ?? "—"}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Incident rate / 100</dt>
                <dd className={`font-medium ${parseFloat(p.incident_rate_per_100) > 2 ? "text-orange-600" : ""}`}>
                  {p.incident_rate_per_100 ?? "—"}
                </dd>
              </div>
            </dl>
          </div>

          {/* AI bundle pitch */}
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium mb-3">AI bundle pitch</div>
            <BundlePitchButton req={pitchReq} />
          </div>

          {/* Log interaction */}
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium mb-3">Log this interaction</div>
            <LogInteractionButton
              accountId={accountId}
              bundleName={p.bundle_name ?? "Bundle recommendation"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
