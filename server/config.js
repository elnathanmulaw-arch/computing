const path = require("path");

const defaultCorsOrigin = "http://localhost:3000";
const defaultAdminEmail = "admin@linksaas.local";
const defaultAdminPassword = "ChangeMe123!";

function parseCorsOrigins(raw) {
  if (!raw) {
    return [defaultCorsOrigin];
  }

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const config = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret_change_in_production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "12h",
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  dbFile: process.env.DB_FILE || path.join(process.cwd(), "data", "app.db"),
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || defaultAdminEmail,
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || defaultAdminPassword,
  adminInviteCode: process.env.ADMIN_INVITE_CODE || "",
};

module.exports = { config };
