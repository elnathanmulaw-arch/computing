require("dotenv").config();

const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { config } = require("./server/config");
const { authRouter } = require("./server/routes/auth");
const { websitesRouter } = require("./server/routes/websites");
const { errorHandler } = require("./server/middleware/error-handler");

// Initialize database at boot.
require("./server/db");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Blocked by CORS policy."));
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "link-building-saas-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/websites", websitesRouter);

const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Link Building SaaS running on http://localhost:${config.port}`);
});
