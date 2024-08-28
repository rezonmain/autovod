import { Migration } from "../../interfaces/migration.js";

export default class InitialMigration extends Migration {
  version = 1;
  name = "Initial";
  upStatements = [
    `CREATE TABLE migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL,
      createdAt TEXT NOT NULL
    )`,
    // column type - enum('info', 'error')
    `CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )`,
  ];
  downStatements = [
    "DROP TABLE IF EXISTS migrations",
    "DROP TABLE IF EXISTS events",
  ];

  constructor(db) {
    super(db);
  }
}
