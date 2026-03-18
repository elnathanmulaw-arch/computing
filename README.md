# LinkVault

LinkVault is a small SaaS-style Next.js application for managing and browsing link building
website inventory.

## Features

- Admin dashboard to create, edit, and delete website listings
- Client-facing marketplace with search, filters, and sorting
- Website stats including:
  - Website name
  - URL
  - Owner name
  - Email
  - Phone
  - General niche price
  - Sensitive niche price
  - DA
  - DR
  - Backlinks pointing
  - Trust Flow
  - Language
  - Region
  - Notes
- Extra delivery data such as placement type, link attribute, traffic, and turnaround time
- Browser-based persistence using localStorage for a working demo without a backend

## Getting started

```bash
npm install
npm run dev
```

## Pages

- `/` - SaaS landing page
- `/marketplace` - client-facing website directory
- `/admin` - admin management dashboard

## Production check

```bash
npm run typecheck
npm run build
```
