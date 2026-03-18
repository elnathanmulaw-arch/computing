# Link Building SaaS (Production Foundation)

Production-ready SaaS starter for managing link-building website inventory with admin/client roles.

## What this includes

### Backend (Express + SQLite)

- Secure API with:
  - `helmet`
  - rate limiting
  - CORS allowlist
- JWT authentication
- Role-based authorization:
  - `admin` can create/update/delete websites
  - `client` can browse/filter websites
- SQLite persistence (`better-sqlite3`) with automatic schema migration/bootstrapping
- Seeded default admin user and sample website records

### Frontend (vanilla SPA in `/public`)

- Login + registration flows
- Authenticated dashboard
- Admin management panel for CRUD
- Client catalog table with filter support
- Summary stats cards

## Tracked website stats

- Website Name
- URL
- Owner Name
- Email
- Phone
- Price (General Niche)
- Price (Sensitive Niche: casino, CBD, forex, etc.)
- DA
- DR
- Backlinks Pointing
- Trust Flow
- Language
- Region
- Niche Type
- Note

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/websites/stats`
- `GET /api/websites`
- `POST /api/websites` (admin only)
- `PUT /api/websites/:id` (admin only)
- `DELETE /api/websites/:id` (admin only)

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## Default admin

Configured through environment variables:

- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`

Set these in `.env` before running in shared environments.
