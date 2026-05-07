import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

function sslConfig() {
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("localhost") || url.includes("127.0.0.1")) return undefined;
  return { rejectUnauthorized: false };
}

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig(),
  });

  await client.connect();
  console.log("Connected to database.");

  for (const file of ["schema.sql", "views.sql"]) {
    const filePath = path.join(__dirname, "../db", file);
    const sql = fs.readFileSync(filePath, "utf8");
    console.log(`Executing ${file}…`);
    await client.query(sql);
    console.log(`✓ ${file} done.`);
  }

  await client.end();
  console.log("\nSetup complete.");
}

run().catch((e) => { console.error(e); process.exit(1); });
