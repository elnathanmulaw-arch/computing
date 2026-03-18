const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const { config } = require("./config");

const dataDir = path.dirname(config.dbFile);
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(config.dbFile);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'client')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS websites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_name TEXT NOT NULL,
      url TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      price_general REAL NOT NULL CHECK(price_general >= 0),
      price_sensitive REAL NOT NULL CHECK(price_sensitive >= 0),
      da INTEGER NOT NULL CHECK(da >= 0 AND da <= 100),
      dr INTEGER NOT NULL CHECK(dr >= 0 AND dr <= 100),
      backlinks_pointing INTEGER NOT NULL CHECK(backlinks_pointing >= 0),
      trust_flow INTEGER NOT NULL CHECK(trust_flow >= 0 AND trust_flow <= 100),
      language TEXT NOT NULL,
      region TEXT NOT NULL,
      niche_type TEXT NOT NULL CHECK(niche_type IN ('General', 'Sensitive', 'Mixed')),
      note TEXT NOT NULL DEFAULT '',
      created_by INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT
    );
  `);
}

function seedAdmin() {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(config.defaultAdminEmail);
  if (existing) {
    return;
  }

  const passwordHash = bcrypt.hashSync(config.defaultAdminPassword, 12);
  db.prepare(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')"
  ).run("Default Admin", config.defaultAdminEmail, passwordHash);
}

function seedWebsites() {
  const row = db.prepare("SELECT COUNT(*) AS count FROM websites").get();
  if (row.count > 0) {
    return;
  }

  const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1").get();
  if (!admin) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO websites (
      website_name, url, owner_name, email, phone,
      price_general, price_sensitive, da, dr, backlinks_pointing, trust_flow,
      language, region, niche_type, note, created_by
    ) VALUES (
      @website_name, @url, @owner_name, @email, @phone,
      @price_general, @price_sensitive, @da, @dr, @backlinks_pointing, @trust_flow,
      @language, @region, @niche_type, @note, @created_by
    )
  `);

  const websites = [
    {
      website_name: "MarketPulse Daily",
      url: "https://marketpulse.example",
      owner_name: "Ava Bennett",
      email: "ava@marketpulse.example",
      phone: "+1-555-0131",
      price_general: 140,
      price_sensitive: 220,
      da: 54,
      dr: 61,
      backlinks_pointing: 12600,
      trust_flow: 39,
      language: "English",
      region: "North America",
      niche_type: "Mixed",
      note: "Sponsored post live within 72 hours.",
      created_by: admin.id,
    },
    {
      website_name: "Global Startup Lens",
      url: "https://startuplens.example",
      owner_name: "Liam Ortega",
      email: "liam@startuplens.example",
      phone: "+44-20-5550-0122",
      price_general: 95,
      price_sensitive: 170,
      da: 47,
      dr: 52,
      backlinks_pointing: 7800,
      trust_flow: 31,
      language: "English",
      region: "Europe",
      niche_type: "General",
      note: "Accepts SaaS, marketing, and tech only.",
      created_by: admin.id,
    },
  ];

  const txn = db.transaction((records) => {
    for (const record of records) {
      insert.run(record);
    }
  });

  txn(websites);
}

migrate();
seedAdmin();
seedWebsites();

module.exports = { db };
