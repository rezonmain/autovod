/** @import { StatementSync } from '../jsdoc.types'; */
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const DIRNAME = process.cwd();
const DB_PATH = path.resolve(DIRNAME, path.join("data", "db", "db.sqlite"));

export class Database {
  /**
   * @returns {Database}
   */
  _instance;

  /**
   * @type {DatabaseSync}
   */
  conn;

  constructor() {}

  /**
   * @returns {Database}
   */
  static getInstance() {
    if (!this._instance) {
      this._instance = new Database();
    }
    return this._instance;
  }

  init() {
    if (!this.conn) {
      this.conn = new DatabaseSync(DB_PATH);
    }
  }

  /**
   *
   * @param {string} sql
   * @returns {Error | void}
   */
  exec(sql) {
    try {
      if (!this.conn) {
        throw new Error("[Database] Database not initialized");
      }
      return this.conn.exec(sql);
    } catch (error) {
      return error;
    }
  }

  /**
   * @param {string} sql
   * @returns {StatementSync} - prepared statement
   */
  prepare(sql) {
    return this.conn.prepare(sql);
  }

  close() {
    if (!this.conn) {
      return;
    }
    this.conn.close();
  }

  open() {
    return this.conn.open();
  }
}
