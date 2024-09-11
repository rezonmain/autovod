/** @import { Migration } from '../interfaces/migration.js' */
import path from "node:path";
import { readdir } from "node:fs/promises";
import { Database } from "../modules/database.js";

const DIRNAME = process.cwd();
const MIGRATIONS_PATH = path.resolve(DIRNAME, path.join("data", "migrations"));

const db = Database.getInstance();
db.init();

async function migrate() {
  const startTime = performance.now();

  const migrationFiles = await readdir(MIGRATIONS_PATH);

  if (!migrationFiles?.length) {
    console.log("[migrate] No migration files found");
    return;
  }

  /**
   * @type {Migration[]}
   */
  const migrations = await Promise.all(
    migrationFiles.map(async (file) => {
      const { default: Migration } = await import(
        path.join(MIGRATIONS_PATH, file)
      );
      return new Migration(db);
    })
  );

  migrations.sort((a, b) => a.version - b.version);

  let dbMigrationVersion = 0;

  try {
    const query = db.prepare(
      "SELECT version FROM migrations WHERE version IN ( SELECT max( version ) FROM migrations );"
    );

    const res = query.get();

    if (!res?.version) {
      dbMigrationVersion = 0;
    } else {
      dbMigrationVersion = Number(res.version);
    }
  } catch {
    console.log(
      "[migrate] Migrations table does not exist. Executing from initial migration"
    );
    dbMigrationVersion = 0;
  }

  try {
    for (const migration of migrations) {
      if (migration.version <= dbMigrationVersion) {
        console.log(
          `🔰 [migrate] Skipping migration ${migration.version}, named: ${migration.name}.`
        );
        continue;
      }
      console.log(`🔄 [migrate] Migrating to version ${migration.version}`);
      migration.up();
      console.log(`✅ [migrate] Migrated to version ${migration.version}`);
    }

    const endTime = performance.now();
    console.log(
      `🚀 [migrate] Migrations completed in ${endTime - startTime}ms`
    );
  } catch (error) {
    console.error("[migrate]", error);
  }
}

migrate();
