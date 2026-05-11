/**
 * Rename ACC-001 from "FastTrack Logistics USA" to "Aeroflux Logistics"
 * across every table that carries the account_name denormalized.
 *
 *   set DATABASE_URL=postgres://...
 *   node scripts/rename-acc-001.js
 */
const { Client } = require("pg");

function sslConfig() {
  const url = process.env.DATABASE_URL || "";
  if (url.includes("localhost") || url.includes("127.0.0.1")) return undefined;
  return { rejectUnauthorized: false };
}

const OLD_NAME = "FastTrack Logistics USA";
const NEW_NAME = "Aeroflux Logistics";

const TABLES = [
  "bronze_enterprise_contract",
  "silver_enterprise_account_summary",
  "gold_enterprise_bundle_recommendation",
  "gold_finance_o2c_health",
];

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: sslConfig() });
  await client.connect();
  console.log(`Renaming ACC-001: "${OLD_NAME}" -> "${NEW_NAME}"\n`);

  await client.query("BEGIN");
  try {
    for (const t of TABLES) {
      const res = await client.query(
        `UPDATE telco_medallion.${t}
            SET account_name = $1
          WHERE account_id = 'ACC-001' AND account_name = $2`,
        [NEW_NAME, OLD_NAME]
      );
      console.log(`  ${t.padEnd(42)} rows updated: ${res.rowCount}`);
    }
    await client.query("COMMIT");
    console.log("\nCommitted.");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Rolled back:", e.message);
    throw e;
  }

  const verify = await client.query(
    `SELECT 'contract'      AS source, account_name FROM telco_medallion.bronze_enterprise_contract        WHERE account_id='ACC-001'
     UNION ALL SELECT 'summary',   account_name FROM telco_medallion.silver_enterprise_account_summary      WHERE account_id='ACC-001'
     UNION ALL SELECT 'bundle',    account_name FROM telco_medallion.gold_enterprise_bundle_recommendation  WHERE account_id='ACC-001'
     UNION ALL SELECT 'finance',   account_name FROM telco_medallion.gold_finance_o2c_health               WHERE account_id='ACC-001'`
  );
  console.log("\nVerification:");
  for (const r of verify.rows) console.log(`  ${r.source.padEnd(10)} ${r.account_name}`);

  await client.end();
}
run().catch((e) => { console.error(e); process.exit(1); });
