import Link from "next/link";

import { compactNumberFormatter, currencyFormatter } from "@/lib/format";
import { seedWebsites } from "@/lib/seed-data";

export default function HomePage() {
  const totalWebsites = seedWebsites.length;
  const verifiedWebsites = seedWebsites.filter((website) => website.verified).length;
  const generalPriceFloor = Math.min(...seedWebsites.map((website) => website.generalPrice));
  const totalBacklinks = seedWebsites.reduce((sum, website) => sum + website.backlinks, 0);

  return (
    <div className="page-stack">
      <section className="hero hero-home card-gradient">
        <div className="hero-copy">
          <p className="eyebrow">Link building SaaS platform</p>
          <h1>
            Run your website inventory, client marketplace, and pricing intelligence from a
            single dashboard.
          </h1>
          <p className="section-copy">
            LinkVault is designed for outreach teams that need an admin-friendly system to
            manage partner websites and a polished client portal to review metrics, prices,
            regions, languages, and campaign notes.
          </p>

          <div className="button-row">
            <Link className="primary-button" href="/marketplace">
              Explore client marketplace
            </Link>
            <Link className="secondary-button" href="/admin">
              Open admin dashboard
            </Link>
          </div>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <span>Managed websites</span>
            <strong>{totalWebsites}</strong>
          </div>
          <div className="metric-card">
            <span>Verified partners</span>
            <strong>{verifiedWebsites}</strong>
          </div>
          <div className="metric-card">
            <span>Starting price</span>
            <strong>{currencyFormatter.format(generalPriceFloor)}</strong>
          </div>
          <div className="metric-card">
            <span>Total backlinks tracked</span>
            <strong>{compactNumberFormatter.format(totalBacklinks)}</strong>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="panel">
          <p className="eyebrow">Admin features</p>
          <h2>Manage websites with all core stats in one record.</h2>
          <ul className="feature-list">
            <li>Website name, URL, owner, email, phone, and outreach note fields</li>
            <li>Separate general niche and sensitive niche pricing</li>
            <li>DA, DR, backlinks, trust flow, traffic, region, and language metrics</li>
            <li>Status tracking for available, reserved, and sold inventory</li>
          </ul>
        </article>

        <article className="panel">
          <p className="eyebrow">Client experience</p>
          <h2>Give clients a clear marketplace view of available placements.</h2>
          <ul className="feature-list">
            <li>Search and filter by region, language, niche, and availability</li>
            <li>Sort listings by SEO authority, backlinks, or pricing</li>
            <li>Review notes, placement type, and link attribute expectations</li>
            <li>Inspect verified inventory before placing an order</li>
          </ul>
        </article>

        <article className="panel">
          <p className="eyebrow">SaaS workflow</p>
          <h2>Built for agencies, broker teams, and in-house SEO operations.</h2>
          <ul className="feature-list">
            <li>Browser-persisted demo data for quick prototyping and extension</li>
            <li>Responsive cards and forms for desktop and mobile use</li>
            <li>Reusable TypeScript data model ready for a backend later</li>
            <li>Simple Next.js structure that is easy to deploy and customize</li>
          </ul>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <p className="eyebrow">What each website record includes</p>
          <h2>Everything needed to qualify a placement quickly.</h2>
          <div className="stats-grid">
            {[
              "Website Name",
              "Website URL",
              "Owner Name",
              "Email",
              "Phone",
              "General Niche Price",
              "Sensitive Niche Price",
              "DA / DR",
              "Backlinks Pointing",
              "Trust Flow",
              "Language",
              "Region",
              "Notes",
            ].map((label) => (
              <div key={label}>
                <span>Field</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Typical journey</p>
          <h2>How the admin and client views work together.</h2>
          <div className="timeline">
            <div>
              <strong>1. Admin uploads inventory</strong>
              <p>Capture partner site details, outreach notes, and pricing rules.</p>
            </div>
            <div>
              <strong>2. Clients browse the marketplace</strong>
              <p>Review SEO metrics, pricing tiers, and website availability.</p>
            </div>
            <div>
              <strong>3. Teams shortlist targets</strong>
              <p>Use filters and verified badges to narrow down quality placements.</p>
            </div>
            <div>
              <strong>4. Campaign operations scale</strong>
              <p>Extend the same data model into a backend, CRM, or order workflow.</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
