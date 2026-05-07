import { Client } from "pg";

function sslConfig() {
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("localhost") || url.includes("127.0.0.1")) return undefined;
  return { rejectUnauthorized: false };
}

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: sslConfig() });
  await client.connect();

  const tables = [
    "bronze_consumer_crm",
    "silver_consumer_customer_profile",
    "gold_consumer_micro_segment",
    "bronze_enterprise_contract",
    "silver_enterprise_account_summary",
    "gold_enterprise_bundle_recommendation",
    "gold_finance_o2c_health",
    "cx_interaction_log",
  ];

  console.log("\nRow counts:\n");
  for (const t of tables) {
    const res = await client.query(`SELECT COUNT(*) FROM telco_medallion.${t}`);
    console.log(`  ${t.padEnd(42)} ${res.rows[0].count}`);
  }
  console.log();
  await client.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
