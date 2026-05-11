export const dynamic = "force-dynamic";

import { getConsumer360 } from "@/lib/db";
import { fmtUSD, fmtDate, fmtPct, fmtSalesTax, churnColor, churnLabel, nbaColor } from "@/lib/format";
import { notFound } from "next/navigation";
import { CallScriptButton } from "./CallScriptButton";
import { LogInteractionButton } from "./LogInteractionButton";

export default async function ConsumerPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const { profile: p, interactions } = await getConsumer360(customerId);
  if (!p) notFound();

  const churnScore = parseFloat(p.churn_risk_score ?? "0");

  const scriptReq = {
    customer_name: p.full_name,
    contract_type: p.contract_type,
    plan_name: p.plan_name,
    monthly_plan_fee: parseFloat(p.monthly_plan_fee ?? "0"),
    state: p.state,
    language_pref: p.language_pref,
    tenure_months: p.tenure_months ?? 0,
    segment_label: p.segment_label ?? "",
    churn_risk_score: churnScore,
    nba_action: p.nba_action ?? "RETAIN",
    nba_offer: p.nba_offer ?? "",
    nba_channel: p.nba_channel ?? "CALL",
    top_app_category: p.top_app_category ?? "",
    avg_monthly_data_gb: parseFloat(p.avg_monthly_data_gb ?? "0"),
    streaming_hrs_month: parseFloat(p.streaming_hrs_month ?? "0"),
    gaming_hrs_month: parseFloat(p.gaming_hrs_month ?? "0"),
    data_overage_flag: p.data_overage_flag ?? false,
    late_payment_count_6m: p.late_payment_count_6m ?? 0,
    support_calls_90d: p.support_calls_90d ?? 0,
  };

  return (
    <div className="p-6 max-w-[1300px] mx-auto">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-4">
        <a href="/" className="hover:underline">Search</a>
        <span className="mx-1.5">›</span>
        <span>Consumer</span>
        <span className="mx-1.5">›</span>
        <span>{p.full_name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{p.full_name}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{p.msisdn}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{p.contract_type}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{p.state}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{p.language_pref}</span>
            {p.is_5g_capable && (
              <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">5G capable</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {p.device_model} ({p.device_os}) · Active since {fmtDate(p.activation_date)} · {p.tenure_months} months tenure
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {p.time_zone ?? "America/New_York"} · State sales tax {fmtSalesTax(p.sales_tax_pct)}
          </div>
        </div>
        {/* Churn risk badge */}
        <div className={`rounded-lg border px-5 py-3 text-center ${churnColor(churnScore)}`}>
          <div className="text-xs font-medium uppercase tracking-wide">Churn risk</div>
          <div className="text-3xl font-bold mt-0.5">{(churnScore * 100).toFixed(0)}%</div>
          <div className="text-xs font-semibold mt-0.5">{churnLabel(churnScore)}</div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4 mb-7">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">Monthly fee (pre-tax)</div>
          <div className="text-xl font-semibold mt-1">{fmtUSD(p.monthly_plan_fee)}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">ARPU</div>
          <div className="text-xl font-semibold mt-1">{fmtUSD(p.arpu)}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">CLV score</div>
          <div className="text-xl font-semibold mt-1">{p.clv_score ?? "—"}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">NPS score</div>
          <div className={`text-xl font-semibold mt-1 ${parseInt(p.nps_score) >= 50 ? "text-green-600" : parseInt(p.nps_score) >= 0 ? "text-amber-600" : "text-red-600"}`}>
            {p.nps_score ?? "—"}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">Avg data / month</div>
          <div className="text-xl font-semibold mt-1">{p.avg_monthly_data_gb ?? "—"} GB</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="col-span-2 space-y-5">
          {/* Micro-segment */}
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-medium">Customer segment</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.segment_description}</div>
              </div>
              <span className="text-xs bg-muted border px-2 py-1 rounded font-mono">{p.segment_code}</span>
            </div>
            <div className="text-sm font-semibold mb-3">{p.segment_label}</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Upsell propensity", val: p.upsell_propensity },
                { label: "Data upgrade propensity", val: p.data_upgrade_propensity },
              ].map(({ label, val }) => {
                const pct = Math.round(parseFloat(val ?? "0") * 100);
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Usage profile */}
          <div className="rounded-lg border bg-card p-5">
            <div className="text-sm font-medium mb-4">Usage profile</div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              {[
                { label: "Top app category",  val: p.top_app_category ?? "—" },
                { label: "Streaming",          val: `${p.streaming_hrs_month ?? 0} hrs/month` },
                { label: "Gaming",             val: `${p.gaming_hrs_month ?? 0} hrs/month` },
                { label: "Fintech sessions",   val: `${p.fintech_sessions_month ?? 0}/month` },
                { label: "Avg call mins",      val: `${p.avg_call_mins_month ?? 0}/month` },
                { label: "Avg SMS",            val: `${p.avg_sms_count_month ?? 0}/month` },
                { label: "Roaming trips (90d)",val: `${p.roaming_trips_90d ?? 0}` },
                { label: "Data overage",       val: p.data_overage_flag ? "⚠ Yes" : "No" },
                { label: "5G capable",         val: p.is_5g_capable ? "Yes" : "No" },
              ].map(({ label, val }) => (
                <div key={label} className="rounded-md bg-muted p-2.5">
                  <div className="text-muted-foreground mb-0.5">{label}</div>
                  <div className="font-medium">{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Interaction history */}
          {interactions.length > 0 && (
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted text-sm font-medium">
                Interaction history
              </div>
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
                      <td className="px-4 py-2 text-xs max-w-[200px] truncate">{i.nba_offer_presented ?? "—"}</td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          i.nba_outcome === "ACCEPTED"   ? "bg-green-50 text-green-700" :
                          i.nba_outcome === "ESCALATED"  ? "bg-red-50 text-red-700"    :
                          i.nba_outcome === "REJECTED"   ? "bg-orange-50 text-orange-700" :
                          "bg-muted text-muted-foreground"
                        }`}>{i.nba_outcome ?? "—"}</span>
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
          {/* NBA card */}
          <div className={`rounded-lg border p-4 ${nbaColor(p.nba_action)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide">Next best action</span>
              <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${nbaColor(p.nba_action)}`}>
                {p.nba_action}
              </span>
            </div>
            <p className="text-sm font-semibold leading-snug mb-1">{p.nba_offer}</p>
            <div className="text-xs opacity-75">Recommended channel: {p.nba_channel}</div>
          </div>

          {/* AI call script */}
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium mb-3">AI call script</div>
            <CallScriptButton req={scriptReq} />
          </div>

          {/* Log interaction */}
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium mb-3">Log this interaction</div>
            <LogInteractionButton
              customerId={customerId}
              nbaOffer={p.nba_offer ?? ""}
              scriptGenerated={false}
            />
          </div>

          {/* Payment behaviour */}
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium mb-3">Payment behaviour</div>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Late payments (6m)</dt>
                <dd className={`font-medium ${p.late_payment_count_6m > 0 ? "text-red-600" : ""}`}>
                  {p.late_payment_count_6m ?? 0}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Support calls (90d)</dt>
                <dd className={`font-medium ${p.support_calls_90d > 1 ? "text-orange-600" : ""}`}>
                  {p.support_calls_90d ?? 0}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Income band</dt>
                <dd className="font-medium">{p.income_band ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Segment version</dt>
                <dd className="text-muted-foreground">{p.segment_version ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Segment date</dt>
                <dd>{fmtDate(p.segment_date)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
