/**
 * Runs the consumer-search query exactly as the app does, against DATABASE_URL.
 * Prints the result rows on success, or the full PG error on failure.
 *
 *   set DATABASE_URL=postgres://...
 *   node scripts/diagnose-search.js CUST-001
 */
const { Client } = require("pg");

function sslConfig() {
  const url = process.env.DATABASE_URL || "";
  if (url.includes("localhost") || url.includes("127.0.0.1")) return undefined;
  return { rejectUnauthorized: false };
}

const q = process.argv[2] || "CUST-001";

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: sslConfig() });
  await client.connect();
  console.log("Connected. Probing schema first...");

  const cols = await client.query(`
    SELECT table_name, column_name
      FROM information_schema.columns
     WHERE table_schema = 'telco_medallion'
       AND table_name IN ('bronze_consumer_crm','silver_consumer_customer_profile','gold_consumer_micro_segment')
     ORDER BY table_name, ordinal_position
  `);
  console.log("\nColumns on the three tables search hits:");
  let lastTable = "";
  for (const r of cols.rows) {
    if (r.table_name !== lastTable) { console.log(`\n  [${r.table_name}]`); lastTable = r.table_name; }
    process.stdout.write(`  ${r.column_name}`);
  }
  console.log("\n");

  const sql = `
    SELECT c.customer_id, c.msisdn, c.full_name, c.contract_type,
           c.plan_name, c.monthly_plan_fee, c.state,
           p.churn_risk_score, g.segment_label
    FROM telco_medallion.bronze_consumer_crm c
    LEFT JOIN telco_medallion.silver_consumer_customer_profile p USING (customer_id)
    LEFT JOIN telco_medallion.gold_consumer_micro_segment g USING (customer_id)
    WHERE c.full_name ILIKE $1 OR c.msisdn ILIKE $1 OR c.customer_id ILIKE $1
    ORDER BY p.churn_risk_score DESC NULLS LAST
    LIMIT 20
  `;
  const term = `%${q}%`;

  console.log(`Running search for q='${q}'...\n`);
  try {
    const res = await client.query(sql, [term]);
    console.log(`OK — ${res.rows.length} row(s):`);
    for (const row of res.rows) console.log(" ", row);
  } catch (e) {
    console.error("QUERY FAILED:");
    console.error("  message:", e.message);
    console.error("  code:   ", e.code);
    console.error("  detail: ", e.detail);
    console.error("  hint:   ", e.hint);
    console.error("  position:", e.position);
  } finally {
    await client.end();
  }
}
run().catch((e) => { console.error(e); process.exit(1); });
