const express = require("express");
const { z } = require("zod");
const { db } = require("../db");
const { authenticate, authorize } = require("../middleware/auth");
const { websiteSchema } = require("../utils/validation");

const router = express.Router();

function mapWebsite(row) {
  return {
    id: row.id,
    websiteName: row.website_name,
    url: row.url,
    ownerName: row.owner_name,
    email: row.email,
    phone: row.phone,
    priceGeneral: row.price_general,
    priceSensitive: row.price_sensitive,
    da: row.da,
    dr: row.dr,
    backlinksPointing: row.backlinks_pointing,
    trustFlow: row.trust_flow,
    language: row.language,
    region: row.region,
    nicheType: row.niche_type,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
}

const querySchema = z.object({
  search: z.string().trim().optional(),
  niche: z.enum(["General", "Sensitive", "Mixed"]).optional(),
  language: z.string().trim().optional(),
  region: z.string().trim().optional(),
  minDa: z.coerce.number().int().min(0).max(100).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

function buildWebsiteFilter(parsedQuery) {
  const where = [];
  const params = {};

  if (parsedQuery.search) {
    where.push(
      "(website_name LIKE @search OR url LIKE @search OR owner_name LIKE @search OR email LIKE @search)"
    );
    params.search = `%${parsedQuery.search}%`;
  }
  if (parsedQuery.niche) {
    where.push("niche_type = @niche");
    params.niche = parsedQuery.niche;
  }
  if (parsedQuery.language) {
    where.push("language = @language");
    params.language = parsedQuery.language;
  }
  if (parsedQuery.region) {
    where.push("region = @region");
    params.region = parsedQuery.region;
  }
  if (parsedQuery.minDa !== undefined) {
    where.push("da >= @minDa");
    params.minDa = parsedQuery.minDa;
  }
  if (parsedQuery.maxPrice !== undefined) {
    where.push("price_general <= @maxPrice");
    params.maxPrice = parsedQuery.maxPrice;
  }

  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { sqlWhere, params };
}

router.use(authenticate);

router.get("/stats", (req, res) => {
  const stats = db
    .prepare(`
      SELECT
        COUNT(*) AS totalWebsites,
        ROUND(AVG(da), 0) AS avgDa,
        ROUND(AVG(dr), 0) AS avgDr,
        COALESCE(SUM(backlinks_pointing), 0) AS totalBacklinksPointing,
        ROUND(AVG(price_general), 0) AS avgGeneralPrice,
        ROUND(AVG(price_sensitive), 0) AS avgSensitivePrice
      FROM websites
    `)
    .get();

  return res.json({
    totalWebsites: stats.totalWebsites || 0,
    avgDa: stats.avgDa || 0,
    avgDr: stats.avgDr || 0,
    totalBacklinksPointing: stats.totalBacklinksPointing || 0,
    avgGeneralPrice: stats.avgGeneralPrice || 0,
    avgSensitivePrice: stats.avgSensitivePrice || 0,
  });
});

router.get("/", (req, res, next) => {
  try {
    const parsedQuery = querySchema.parse(req.query);
    const { sqlWhere, params } = buildWebsiteFilter(parsedQuery);
    const offset = (parsedQuery.page - 1) * parsedQuery.limit;

    const rows = db
      .prepare(
        `
          SELECT * FROM websites
          ${sqlWhere}
          ORDER BY id DESC
          LIMIT @limit OFFSET @offset
        `
      )
      .all({ ...params, limit: parsedQuery.limit, offset });

    const countRow = db
      .prepare(`SELECT COUNT(*) AS count FROM websites ${sqlWhere}`)
      .get(params);

    return res.json({
      data: rows.map(mapWebsite),
      meta: {
        page: parsedQuery.page,
        limit: parsedQuery.limit,
        total: countRow.count,
        totalPages: Math.max(1, Math.ceil(countRow.count / parsedQuery.limit)),
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", authorize("admin"), (req, res, next) => {
  try {
    const payload = websiteSchema.parse(req.body);
    const result = db
      .prepare(
        `
          INSERT INTO websites (
            website_name, url, owner_name, email, phone,
            price_general, price_sensitive, da, dr, backlinks_pointing, trust_flow,
            language, region, niche_type, note, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        payload.websiteName,
        payload.url,
        payload.ownerName,
        payload.email,
        payload.phone,
        payload.priceGeneral,
        payload.priceSensitive,
        payload.da,
        payload.dr,
        payload.backlinksPointing,
        payload.trustFlow,
        payload.language,
        payload.region,
        payload.nicheType,
        payload.note || "",
        req.user.id
      );

    const created = db.prepare("SELECT * FROM websites WHERE id = ?").get(result.lastInsertRowid);
    return res.status(201).json({ data: mapWebsite(created) });
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", authorize("admin"), (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid website id." });
    }

    const payload = websiteSchema.parse(req.body);
    const result = db
      .prepare(
        `
          UPDATE websites
          SET
            website_name = ?,
            url = ?,
            owner_name = ?,
            email = ?,
            phone = ?,
            price_general = ?,
            price_sensitive = ?,
            da = ?,
            dr = ?,
            backlinks_pointing = ?,
            trust_flow = ?,
            language = ?,
            region = ?,
            niche_type = ?,
            note = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `
      )
      .run(
        payload.websiteName,
        payload.url,
        payload.ownerName,
        payload.email,
        payload.phone,
        payload.priceGeneral,
        payload.priceSensitive,
        payload.da,
        payload.dr,
        payload.backlinksPointing,
        payload.trustFlow,
        payload.language,
        payload.region,
        payload.nicheType,
        payload.note || "",
        id
      );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Website not found." });
    }

    const updated = db.prepare("SELECT * FROM websites WHERE id = ?").get(id);
    return res.json({ data: mapWebsite(updated) });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", authorize("admin"), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid website id." });
  }

  const result = db.prepare("DELETE FROM websites WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Website not found." });
  }

  return res.status(204).send();
});

module.exports = { websitesRouter: router };
