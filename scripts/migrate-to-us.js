/**
 * One-shot migration: drop and recreate the telco_medallion schema using the
 * US-localized schema.sql + views.sql, then sanity-check row counts.
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL = "postgres://..."
 *   node scripts/migrate-to-us.js
 *
 * Usage (cmd.exe):
 *   set DATABASE_URL=postgres://...
 *   node scripts/migrate-to-us.js
 *
 * Safe to re-run (idempotent: drops + recreates).
 */
const { Client } = require("pg");
const { readFileSync } = require("fs");
const { join } = require("path");

function sslConfig() {
  const url = process.env.DATABASE_URL || "";
  if (url.includes("localhost") || url.includes("127.0.0.1")) return undefined;
  return { rejectUnauthorized: false };
}

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: sslConfig() });
  await client.connect();
  console.log("Connected to Postgres.");

  const repoRoot = join(__dirname, "..");
  const schemaSql = readFileSync(join(repoRoot, "db", "schema.sql"), "utf8");
  const viewsSql  = readFileSync(join(repoRoot, "db", "views.sql"),  "utf8");

  console.log("Dropping existing telco_medallion schema (cascade)...");
  await client.query("DROP SCHEMA IF EXISTS telco_medallion CASCADE;");

  console.log("Applying schema.sql...");
  await client.query(schemaSql);

  console.log("Applying views.sql...");
  await client.query(viewsSql);

  const tables = [
    "bronze_consumer_crm",
    "silver_consumer_customer_profile",
    "gold_consumer_micro_segment",
    "bronze_enterprise_contract",
    "bronze_enterprise_product_catalog",
    "silver_enterprise_account_summary",
    "gold_enterprise_bundle_recommendation",
    "gold_finance_o2c_health",
    "cx_interaction_log",
  ];

  console.log("\nRow counts after migration:\n");
  for (const t of tables) {
    const res = await client.query(`SELECT COUNT(*) FROM telco_medallion.${t}`);
    console.log(`  ${t.padEnd(42)} ${res.rows[0].count}`);
  }

  // Sanity probes — confirm US localization landed. All three should be 0/8.
  const probes = [
    [
      "CRM rows still using SA provinces (expect 0)",
      `SELECT COUNT(*) FROM telco_medallion.bronze_consumer_crm
         WHERE state IN ('Gauteng','W.Cape','KZN','Limpopo','Free State','N.Cape','Mpumalanga','N.West')`,
    ],
    [
      "Columns still ending in _zar (expect 0)",
      `SELECT COUNT(*) FROM information_schema.columns
         WHERE table_schema='telco_medallion' AND column_name LIKE '%_zar'`,
    ],
    [
      "Enterprise contracts with America/* time_zone (expect 8)",
      `SELECT COUNT(*) FROM telco_medallion.bronze_enterprise_contract
         WHERE time_zone LIKE 'America/%'`,
    ],
  ];

  console.log("\nSanity probes:");
  for (const [label, sql] of probes) {
    const r = await client.query(sql);
    console.log(`  ${label.padEnd(50)} ${r.rows[0].count}`);
  }

  // Spot-check CUST-001.
  const cust = await client.query(
    `SELECT customer_id, full_name, plan_name, monthly_plan_fee, state, time_zone, sales_tax_pct
       FROM telco_medallion.bronze_consumer_crm WHERE customer_id = 'CUST-001'`
  );
  console.log("\nCUST-001 sanity row:");
  console.log("  ", cust.rows[0]);

  await client.end();
  console.log("\nDone.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
