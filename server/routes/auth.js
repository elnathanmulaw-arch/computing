const express = require("express");
const bcrypt = require("bcryptjs");
const { db } = require("../db");
const { config } = require("../config");
const { authenticate } = require("../middleware/auth");
const { createToken } = require("../utils/auth");
const { loginSchema, registerSchema } = require("../utils/validation");

const router = express.Router();

function mapUser(userRow) {
  return {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    role: userRow.role,
    createdAt: userRow.created_at,
  };
}

router.post("/register", (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const role = payload.role === "admin" ? "admin" : "client";

    if (role === "admin") {
      const hasValidInviteCode =
        config.adminInviteCode && payload.adminInviteCode === config.adminInviteCode;
      if (!hasValidInviteCode) {
        return res.status(403).json({ error: "Invalid admin invite code." });
      }
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(payload.email);
    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = bcrypt.hashSync(payload.password, 12);
    const result = db
      .prepare(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
      )
      .run(payload.name, payload.email, passwordHash, role);

    const created = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    const token = createToken(created);

    return res.status(201).json({
      token,
      user: mapUser(created),
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(payload.email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const validPassword = bcrypt.compareSync(payload.password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = createToken(user);
    return res.json({
      token,
      user: mapUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authenticate, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) {
    return res.status(401).json({ error: "User does not exist." });
  }

  return res.json({ user: mapUser(user) });
});

module.exports = { authRouter: router };
