const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_DIR = process.env.DB_DIR || '/data/ExerciseDiary';
const DB_PATH = path.join(DB_DIR, 'sqlite.db');

let db = null;

async function initialize() {
  const SQL = await initSqlJs();
  fs.mkdirSync(DB_DIR, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS exercises (
    "ID" INTEGER PRIMARY KEY,
    "GR" TEXT,
    "PLACE" TEXT,
    "NAME" TEXT,
    "DESCR" TEXT,
    "IMAGE" TEXT,
    "COLOR" TEXT,
    "WEIGHT" INTEGER,
    "REPS" INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sets (
    "ID" INTEGER PRIMARY KEY,
    "DATE" TEXT,
    "NAME" TEXT,
    "COLOR" TEXT,
    "WEIGHT" INTEGER,
    "REPS" INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS weight (
    "ID" INTEGER PRIMARY KEY,
    "DATE" TEXT,
    "WEIGHT" INTEGER
  )`);

  persist();
}

function persist() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDb() {
  return db;
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function run(sql, params = []) {
  db.run(sql, params);
  const result = db.exec('SELECT last_insert_rowid()');
  const lastId = (result.length > 0 && result[0].values.length > 0) ? result[0].values[0][0] : 0;
  persist();
  return lastId;
}

module.exports = { initialize, getDb, query, run, persist };
