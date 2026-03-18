const { z } = require("zod");

const emailSchema = z.string().trim().email("Must be a valid email address.");

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  password: z.string().min(8).max(128),
  role: z.enum(["client", "admin"]).optional(),
  adminInviteCode: z.string().optional(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

const websiteSchema = z
  .object({
    websiteName: z.string().trim().min(2).max(160),
    url: z.string().trim().url("Must be a valid URL."),
    ownerName: z.string().trim().min(2).max(120),
    email: emailSchema,
    phone: z.string().trim().min(4).max(40),
    priceGeneral: z.number().nonnegative(),
    priceSensitive: z.number().nonnegative(),
    da: z.number().int().min(0).max(100),
    dr: z.number().int().min(0).max(100),
    backlinksPointing: z.number().int().nonnegative(),
    trustFlow: z.number().int().min(0).max(100),
    language: z.string().trim().min(2).max(80),
    region: z.string().trim().min(2).max(80),
    nicheType: z.enum(["General", "Sensitive", "Mixed"]),
    note: z.string().max(2000).optional().default(""),
  })
  .refine((payload) => payload.priceSensitive >= payload.priceGeneral, {
    message: "Sensitive niche price must be greater than or equal to general niche price.",
    path: ["priceSensitive"],
  });

module.exports = { registerSchema, loginSchema, websiteSchema };
