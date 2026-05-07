import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function sslConfig() {
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("localhost") || url.includes("127.0.0.1")) return undefined;
  return { rejectUnauthorized: false };
}

export const pool =
  global.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig(),
    max: 10,
  });

if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

export async function query<T = unknown>(sql: string, params: unknown[] = []) {
  const res = await pool.query(sql, params);
  return res.rows as T[];
}

// ---------- Search ----------

export async function searchConsumers(q: string) {
  const term = `%${q}%`;
  return query<{
    customer_id: string; msisdn: string; full_name: string;
    contract_type: string; plan_name: string; monthly_plan_fee: string;
    province: string; churn_risk_score: string; segment_label: string;
  }>(`
    SELECT c.customer_id, c.msisdn, c.full_name, c.contract_type,
           c.plan_name, c.monthly_plan_fee, c.province,
           p.churn_risk_score, g.segment_label
    FROM telco_medallion.bronze_consumer_crm c
    LEFT JOIN telco_medallion.silver_consumer_customer_profile p USING (customer_id)
    LEFT JOIN telco_medallion.gold_consumer_micro_segment g USING (customer_id)
    WHERE c.full_name ILIKE $1 OR c.msisdn ILIKE $1 OR c.customer_id ILIKE $1
    ORDER BY p.churn_risk_score DESC NULLS LAST
    LIMIT 20
  `, [term]);
}

export async function searchEnterprises(q: string) {
  const term = `%${q}%`;
  return query<{
    account_id: string; account_name: string; industry_label: string;
    contract_annual_value: string; billing_province: string;
    urgency: string; health_label: string; months_to_renewal: string;
  }>(`
    SELECT s.account_id, s.account_name, s.industry_label,
           s.contract_annual_value, s.months_to_renewal,
           c.billing_province, b.urgency, h.health_label
    FROM telco_medallion.silver_enterprise_account_summary s
    LEFT JOIN telco_medallion.bronze_enterprise_contract c USING (account_id)
    LEFT JOIN telco_medallion.gold_enterprise_bundle_recommendation b USING (account_id)
    LEFT JOIN telco_medallion.gold_finance_o2c_health h USING (account_id)
    WHERE s.account_name ILIKE $1 OR s.account_id ILIKE $1
    ORDER BY b.urgency DESC NULLS LAST, s.contract_annual_value DESC
    LIMIT 20
  `, [term]);
}

// ---------- Consumer 360 ----------

export async function getConsumer360(customer_id: string) {
  const [profile] = await query<any>(`
    SELECT * FROM telco_medallion.v_consumer_360 WHERE customer_id = $1
  `, [customer_id]);

  const interactions = await query<any>(`
    SELECT * FROM telco_medallion.cx_interaction_log
    WHERE customer_id = $1
    ORDER BY created_at DESC LIMIT 8
  `, [customer_id]);

  return { profile, interactions };
}

// ---------- Enterprise 360 ----------

export async function getEnterprise360(account_id: string) {
  const [profile] = await query<any>(`
    SELECT * FROM telco_medallion.v_enterprise_360 WHERE account_id = $1
  `, [account_id]);

  const interactions = await query<any>(`
    SELECT * FROM telco_medallion.cx_interaction_log
    WHERE account_id = $1
    ORDER BY created_at DESC LIMIT 8
  `, [account_id]);

  return { profile, interactions };
}

// ---------- Log interaction ----------

export async function logInteraction(args: {
  customer_id?: string | null;
  account_id?: string | null;
  customer_type: string;
  agent_id: string;
  channel: string;
  nba_offer_presented?: string | null;
  nba_outcome?: string | null;
  call_script_used?: boolean;
  notes?: string | null;
}) {
  const [row] = await query<{ interaction_id: number }>(`
    INSERT INTO telco_medallion.cx_interaction_log
      (customer_id, account_id, customer_type, agent_id, channel,
       nba_offer_presented, nba_outcome, call_script_used, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING interaction_id
  `, [
    args.customer_id ?? null,
    args.account_id ?? null,
    args.customer_type,
    args.agent_id,
    args.channel,
    args.nba_offer_presented ?? null,
    args.nba_outcome ?? null,
    args.call_script_used ?? false,
    args.notes ?? null,
  ]);
  return row.interaction_id;
}

// ---------- Landing stats ----------

export async function getLandingStats() {
  const [stats] = await query<{
    total_consumers: string; high_churn_count: string;
    total_enterprises: string; urgent_upsell_count: string;
  }>(`
    SELECT
      (SELECT COUNT(*) FROM telco_medallion.bronze_consumer_crm)                                    AS total_consumers,
      (SELECT COUNT(*) FROM telco_medallion.silver_consumer_customer_profile WHERE churn_risk_score >= 0.4) AS high_churn_count,
      (SELECT COUNT(*) FROM telco_medallion.silver_enterprise_account_summary)                      AS total_enterprises,
      (SELECT COUNT(*) FROM telco_medallion.gold_enterprise_bundle_recommendation WHERE urgency = 'HIGH') AS urgent_upsell_count
  `);
  return stats;
}
