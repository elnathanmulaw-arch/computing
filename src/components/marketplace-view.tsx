"use client";

import { useMemo, useState } from "react";

import { compactNumberFormatter, currencyFormatter, numberFormatter } from "@/lib/format";
import { useWebsiteRecords } from "@/lib/use-website-records";

type SortOption =
  | "featured"
  | "da-desc"
  | "dr-desc"
  | "general-price-asc"
  | "sensitive-price-asc"
  | "backlinks-desc";

export function MarketplaceView() {
  const { records, hydrated } = useWebsiteRecords();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [language, setLanguage] = useState("all");
  const [niche, setNiche] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  const filters = useMemo(
    () => ({
      regions: Array.from(new Set(records.map((record) => record.region))).sort(),
      languages: Array.from(new Set(records.map((record) => record.language))).sort(),
      niches: Array.from(new Set(records.map((record) => record.niche))).sort(),
    }),
    [records],
  );

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const nextRecords = records.filter((record) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          record.websiteName,
          record.url,
          record.ownerName,
          record.niche,
          record.region,
          record.language,
          record.note,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return (
        matchesQuery &&
        (region === "all" || record.region === region) &&
        (language === "all" || record.language === language) &&
        (niche === "all" || record.niche === niche) &&
        (status === "all" || record.status === status)
      );
    });

    return nextRecords.sort((left, right) => {
      switch (sortBy) {
        case "da-desc":
          return right.da - left.da;
        case "dr-desc":
          return right.dr - left.dr;
        case "general-price-asc":
          return left.generalPrice - right.generalPrice;
        case "sensitive-price-asc":
          return left.sensitivePrice - right.sensitivePrice;
        case "backlinks-desc":
          return right.backlinks - left.backlinks;
        case "featured":
        default:
          return (
            Number(right.verified) - Number(left.verified) ||
            right.dr - left.dr ||
            right.trustFlow - left.trustFlow
          );
      }
    });
  }, [language, niche, query, records, region, sortBy, status]);

  const marketplaceStats = useMemo(() => {
    const availableListings = records.filter((record) => record.status === "available");
    const generalPriceFloor = availableListings.length
      ? Math.min(...availableListings.map((record) => record.generalPrice))
      : 0;
    const averageTrustFlow = records.length
      ? records.reduce((total, record) => total + record.trustFlow, 0) / records.length
      : 0;

    return {
      totalListings: records.length,
      availableListings: availableListings.length,
      verifiedListings: records.filter((record) => record.verified).length,
      generalPriceFloor,
      averageTrustFlow,
    };
  }, [records]);

  return (
    <div className="page-stack">
      <section className="hero card-gradient">
        <div>
          <p className="eyebrow">Client marketplace</p>
          <h1>Browse vetted link building websites with transparent pricing and SEO metrics.</h1>
          <p className="section-copy">
            Clients can review authority scores, backlink profiles, pricing for general and
            sensitive niches, and outreach notes before requesting a placement.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <span>Total listings</span>
            <strong>{marketplaceStats.totalListings}</strong>
          </div>
          <div className="metric-card">
            <span>Available now</span>
            <strong>{marketplaceStats.availableListings}</strong>
          </div>
          <div className="metric-card">
            <span>Verified websites</span>
            <strong>{marketplaceStats.verifiedListings}</strong>
          </div>
          <div className="metric-card">
            <span>Starting general price</span>
            <strong>{currencyFormatter.format(marketplaceStats.generalPriceFloor)}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Search and filter</p>
            <h2>Find the right website for each campaign</h2>
          </div>
          <span className="pill">
            {hydrated ? `${filteredRecords.length} records loaded` : "Syncing browser data"}
          </span>
        </div>

        <div className="filters-grid">
          <label>
            Search
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by website, owner, niche, region, or notes"
              type="search"
              value={query}
            />
          </label>
          <label>
            Region
            <select onChange={(event) => setRegion(event.target.value)} value={region}>
              <option value="all">All regions</option>
              {filters.regions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Language
            <select onChange={(event) => setLanguage(event.target.value)} value={language}>
              <option value="all">All languages</option>
              {filters.languages.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Niche
            <select onChange={(event) => setNiche(event.target.value)} value={niche}>
              <option value="all">All niches</option>
              {filters.niches.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Availability
            <select onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </label>
          <label>
            Sort by
            <select onChange={(event) => setSortBy(event.target.value as SortOption)} value={sortBy}>
              <option value="featured">Featured</option>
              <option value="da-desc">Highest DA</option>
              <option value="dr-desc">Highest DR</option>
              <option value="general-price-asc">Lowest general price</option>
              <option value="sensitive-price-asc">Lowest sensitive price</option>
              <option value="backlinks-desc">Most backlinks</option>
            </select>
          </label>
        </div>
      </section>

      <section className="listing-stack">
        {filteredRecords.map((record) => (
          <article className="listing-card marketplace-card" key={record.id}>
            <div className="listing-header">
              <div>
                <div className="card-badges">
                  <span className={`status-badge status-${record.status}`}>{record.status}</span>
                  {record.verified ? <span className="pill">Verified</span> : null}
                  <span className="pill">{record.placementType}</span>
                  <span className="pill">{record.linkAttribute}</span>
                </div>
                <h3>{record.websiteName}</h3>
                <a href={record.url} rel="noreferrer" target="_blank">
                  {record.url}
                </a>
              </div>
              <div className="price-column">
                <div>
                  <span>General niche</span>
                  <strong>{currencyFormatter.format(record.generalPrice)}</strong>
                </div>
                <div>
                  <span>Sensitive niche</span>
                  <strong>{currencyFormatter.format(record.sensitivePrice)}</strong>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <div>
                <span>Owner</span>
                <strong>{record.ownerName}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{record.email}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{record.phone}</strong>
              </div>
              <div>
                <span>DA</span>
                <strong>{record.da}</strong>
              </div>
              <div>
                <span>DR</span>
                <strong>{record.dr}</strong>
              </div>
              <div>
                <span>Backlinks pointing</span>
                <strong>{compactNumberFormatter.format(record.backlinks)}</strong>
              </div>
              <div>
                <span>Trust Flow</span>
                <strong>{record.trustFlow}</strong>
              </div>
              <div>
                <span>Language</span>
                <strong>{record.language}</strong>
              </div>
              <div>
                <span>Region</span>
                <strong>{record.region}</strong>
              </div>
              <div>
                <span>Niche</span>
                <strong>{record.niche}</strong>
              </div>
              <div>
                <span>Monthly traffic</span>
                <strong>{compactNumberFormatter.format(record.monthlyTraffic)}</strong>
              </div>
              <div>
                <span>Turnaround</span>
                <strong>{record.turnaroundDays} days</strong>
              </div>
            </div>

            <div className="note-panel">
              <div>
                <p className="eyebrow">Notes</p>
                <p>{record.note}</p>
              </div>

              <div className="marketplace-aside">
                <div>
                  <span>Avg. outreach value</span>
                  <strong>
                    {currencyFormatter.format((record.generalPrice + record.sensitivePrice) / 2)}
                  </strong>
                </div>
                <div>
                  <span>Last updated</span>
                  <strong>{record.lastUpdated}</strong>
                </div>
                <div>
                  <span>Trust benchmark</span>
                  <strong>{marketplaceStats.averageTrustFlow.toFixed(1)}</strong>
                </div>
              </div>
            </div>
          </article>
        ))}

        {filteredRecords.length === 0 ? (
          <div className="empty-state">
            <h3>No websites match the current filters.</h3>
            <p>Try broadening the niche, region, or pricing filters to see more inventory.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
