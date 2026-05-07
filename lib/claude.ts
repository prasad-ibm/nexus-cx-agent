import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are an AI assistant embedded in the call centre platform of Nexus Telecom,
a leading South African telecommunications provider.

You support call centre agents in two roles:
1. Consumer agents handling retail customer calls about mobile plans, data usage, billing, and churn.
2. Enterprise account managers pitching connectivity bundles to SA businesses in sectors like
   logistics, mining, healthcare, retail, energy, and financial services.

South African context you must reflect:
- Currency is South African Rand (ZAR). Always write amounts as "R X,XXX" (e.g. R 899, R 2 800 000).
- Reference load-shedding resilience when relevant (SD-WAN/IoT failover is a strong selling point).
- POPIA (Protection of Personal Information Act) compliance is relevant for healthcare and finserv pitches.
- 5G SA standalone is being rolled out in metros (Gauteng, Cape Town, Durban); rural coverage is 4G.
- Customers speak English, Zulu, Sotho, Afrikaans — match the language preference when noted.
- Key competitors: MTN, Vodacom, Cell C, Telkom — never disparage them, just differentiate on value.
- Products: Business SIMs (4G/5G), network slices (low-latency / high-bandwidth), managed SD-WAN,
  IoT management platform, fleet telematics SIMs, managed security gateway, private 5G nodes.

Tone:
- Consumer scripts: warm, direct, solution-focused. 120 words max.
- Enterprise pitches: consultative, data-led, professional. 200 words max.
- Never make promises about pricing outside the approved offers provided.
- Never mention legal action or service termination.`;

// ── Consumer call script ──────────────────────────────────────────────────────

export interface ConsumerScriptRequest {
  customer_name: string;
  contract_type: string;
  plan_name: string;
  monthly_plan_fee: number;
  province: string;
  language_pref: string;
  tenure_months: number;
  segment_label: string;
  churn_risk_score: number;
  nba_action: string;
  nba_offer: string;
  nba_channel: string;
  top_app_category: string;
  avg_monthly_data_gb: number;
  streaming_hrs_month: number;
  gaming_hrs_month: number;
  data_overage_flag: boolean;
  late_payment_count_6m: number;
  support_calls_90d: number;
}

export async function generateCallScript(req: ConsumerScriptRequest) {
  const churnLabel =
    req.churn_risk_score >= 0.6 ? "CRITICAL" :
    req.churn_risk_score >= 0.4 ? "HIGH" :
    req.churn_risk_score >= 0.2 ? "MEDIUM" : "LOW";

  const userMessage = `Generate a ${req.nba_action} call script for this customer.

CUSTOMER: ${req.customer_name}
  Plan: ${req.plan_name} (R ${req.monthly_plan_fee}/month), ${req.contract_type}
  Province: ${req.province} | Language: ${req.language_pref} | Tenure: ${req.tenure_months} months
  Segment: ${req.segment_label}
  Churn risk: ${churnLabel} (${(req.churn_risk_score * 100).toFixed(0)}%)

USAGE SNAPSHOT:
  Top app category: ${req.top_app_category}
  Avg data/month: ${req.avg_monthly_data_gb} GB
  Streaming: ${req.streaming_hrs_month} hrs/month | Gaming: ${req.gaming_hrs_month} hrs/month
  Data overage flag: ${req.data_overage_flag ? "YES — customer hits cap regularly" : "No"}
  Late payments (6m): ${req.late_payment_count_6m} | Support calls (90d): ${req.support_calls_90d}

NBA OFFER TO PRESENT:
  Action: ${req.nba_action}
  Offer: "${req.nba_offer}"
  Preferred channel: ${req.nba_channel}

Write a natural, conversational call script the agent reads aloud. Include [PAUSE] markers.
If the offer is a SAVE/RETAIN action, acknowledge the customer's loyalty first.
End with a clear call-to-action and confirmation step.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content.find((b) => b.type === "text");
  return {
    script: block?.type === "text" ? block.text : "",
    usage: response.usage,
  };
}

// ── Enterprise bundle pitch ───────────────────────────────────────────────────

export interface EnterprisePitchRequest {
  account_name: string;
  industry_label: string;
  bundle_name: string;
  bundle_rationale: string;
  recommended_products: Array<{ name: string; qty: number }>;
  estimated_arr_zar: number;
  uplift_vs_current_pct: number;
  months_to_renewal: number;
  urgency: string;
  gap_5g_upgrade: boolean;
  gap_network_slice: boolean;
  gap_managed_security: boolean;
  gap_iot_platform: boolean;
  gap_sdwan: boolean;
  health_label: string;
  credit_risk_flag: boolean;
  avg_nps: number;
}

export async function generateBundlePitch(req: EnterprisePitchRequest) {
  const gaps = [
    req.gap_5g_upgrade        && "5G SIM upgrade",
    req.gap_network_slice     && "network slice",
    req.gap_managed_security  && "managed security",
    req.gap_iot_platform      && "IoT management platform",
    req.gap_sdwan             && "SD-WAN",
  ].filter(Boolean).join(", ");

  const products = req.recommended_products
    .map((p) => `  - ${p.name} × ${p.qty}`)
    .join("\n");

  const userMessage = `Generate a consultative enterprise bundle pitch for this account.

ACCOUNT: ${req.account_name}
  Industry: ${req.industry_label}
  Months to renewal: ${req.months_to_renewal} | Urgency: ${req.urgency}
  Current NPS: ${req.avg_nps} | O2C health: ${req.health_label}
  ${req.credit_risk_flag ? "⚠ Credit risk flag is active — do not commit to extended payment terms." : ""}

BUNDLE: ${req.bundle_name}
  Rationale: ${req.bundle_rationale}
  Estimated ARR: R ${req.estimated_arr_zar.toLocaleString()} (${req.uplift_vs_current_pct}% uplift on current contract)

PRODUCT GAPS BEING ADDRESSED:
${gaps || "All gaps addressed"}

RECOMMENDED PRODUCTS:
${products}

Write a structured pitch the account manager delivers in an opening call.
Lead with the business problem the customer faces, then bridge to the solution.
Cite the estimated ARR uplift to make the value tangible.
Close with a specific next step (e.g. schedule a technical workshop, send a proposal).`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 550,
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content.find((b) => b.type === "text");
  return {
    pitch: block?.type === "text" ? block.text : "",
    usage: response.usage,
  };
}
