# Link Building SaaS Website Data Management

Simple SaaS-style web app to manage and browse link-building website inventory.

## Features

- **Admin view** for managing website inventory
  - Add, edit, and delete websites
  - Track:
    - Website Name
    - URL
    - Owner Name
    - Email
    - Phone
    - Website Price (General Niche)
    - Website Price (Sensitive Niche: casino, CBD, forex, etc.)
    - DA
    - DR
    - Backlinks Pointing
    - Trust Flow
    - Language
    - Region
    - Niche Type
    - Note section
- **Client view** to browse all websites
  - Search and filter by niche, language, region, DA, and max price
- **Summary cards** for quick marketplace stats
- Local storage persistence in browser

## Run

This is a static frontend project.

1. Open `index.html` directly in the browser, or
2. Serve with a static server (example):

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
