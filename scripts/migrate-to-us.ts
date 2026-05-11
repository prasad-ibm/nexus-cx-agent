/**
 * One-shot migration: drop and recreate the telco_medallion schema using the
 * US-localized schema.sql + views.sql, then sanity-check row counts.
 *
 * Usage:
 *   DATABASE_URL=postgres://... npx ts-node -P tsconfig.scripts.json scripts/migrate-to-us.ts
 *
 * Or add as an npm script. Safe to re-run (idempotent: drops + recreates).
 */
import { Client } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

function sslConfig() {
  const url = process.env.DATABASE_URL ?? "";
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

  console.log("Dropping existing telco_medallion schema (cascade)…");
  await client.query("DROP SCHEMA IF EXISTS telco_medallion CASCADE;");

  console.log("Applying schema.sql…");
  await client.query(schemaSql);

  console.log("Applying views.sql…");
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

  // Quick sanity probes — confirm US localization landed.
  const probes: Array<[string, string]> = [
    [
      "CRM rows still using SA provinces",
      `SELECT COUNT(*) FROM telco_medallion.bronze_consumer_crm
         WHERE state IN ('Gauteng','W.Cape','KZN','Limpopo','Free State','N.Cape','Mpumalanga','N.West')`,
    ],
    [
      "Enterprise contracts still in ZAR table shape",
      `SELECT COUNT(*) FROM information_schema.columns
         WHERE table_schema='telco_medallion' AND column_name LIKE '%_zar'`,
    ],
    [
      "Enterprise contracts with US time_zone",
      `SELECT COUNT(*) FROM telco_medallion.bronze_enterprise_contract
         WHERE time_zone LIKE 'America/%'`,
    ],
  ];

  console.log("\nSanity probes:");
  for (const [label, sql] of probes) {
    const r = await client.query(sql);
    console.log(`  ${label.padEnd(45)} ${r.rows[0].count}`);
  }

  await client.end();
  console.log("\nDone.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
