const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "fintrack.db"));

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL CHECK(amount > 0),
    category TEXT NOT NULL DEFAULT '',
    description TEXT,
    date TEXT NOT NULL
  )
`);

const existingColumns = new Set(
  db
    .prepare("PRAGMA table_info(transactions)")
    .all()
    .map((column) => column.name),
);
const additions = [
  ["person", "TEXT"],
  ["incomeType", "TEXT"],
  ["expenseType", "TEXT"],
  ["annualSalary", "REAL"],
  ["payments", "INTEGER"],
];

const migrate = db.transaction(() => {
  for (const [name, definition] of additions) {
    if (!existingColumns.has(name))
      db.exec(`ALTER TABLE transactions ADD COLUMN ${name} ${definition}`);
  }
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC, id DESC);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_person ON transactions(person);
  `);
});
migrate();

module.exports = db;
