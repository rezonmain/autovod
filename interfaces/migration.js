/** @import { Database } from '../modules/database.js' */

class Migration {
  /**
   * @type {number}
   */
  version = 0;

  /**
   * @type {string}
   */
  name = "";

  /**
   *
   * @type {Database}
   */
  db;

  /**
   * @type {Array<string>}
   */
  upStatements = [];

  /**
   * @type {Array<string>}
   */
  downStatements = [];

  /**
   *
   * @param {Database} db
   */
  constructor(db) {
    this.db = db;
  }

  up() {
    for (const statements of this.upStatements) {
      this.db.exec(statements);
    }

    const query = this.db.prepare(
      "INSERT INTO migrations (version, createdAt) VALUES (?, ?)"
    );

    query.run(this.version, new Date().toISOString());
  }

  down() {
    for (const statements of this.downStatements) {
      this.db.exec(statements);
    }
  }
}

export { Migration };
