"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import { compactNumberFormatter, currencyFormatter } from "@/lib/format";
import { useWebsiteRecords } from "@/lib/use-website-records";
import { LinkAttribute, PlacementType, WebsiteRecord, WebsiteRecordInput, WebsiteStatus } from "@/lib/types";

const placementTypes: PlacementType[] = [
  "guest-post",
  "niche-edit",
  "homepage",
  "link-insert",
];

const linkAttributes: LinkAttribute[] = ["dofollow", "nofollow", "sponsored"];
const websiteStatuses: WebsiteStatus[] = ["available", "reserved", "sold"];

const initialFormState: WebsiteRecordInput = {
  websiteName: "",
  url: "",
  ownerName: "",
  email: "",
  phone: "",
  generalPrice: 120,
  sensitivePrice: 240,
  da: 40,
  dr: 40,
  backlinks: 1000,
  trustFlow: 20,
  language: "English",
  region: "Global",
  niche: "General",
  monthlyTraffic: 10000,
  turnaroundDays: 5,
  placementType: "guest-post",
  linkAttribute: "dofollow",
  status: "available",
  verified: false,
  note: "",
};

type FormField =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

function formatStatus(status: WebsiteStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function mapRecordToFormState(record: WebsiteRecord): WebsiteRecordInput {
  return {
    websiteName: record.websiteName,
    url: record.url,
    ownerName: record.ownerName,
    email: record.email,
    phone: record.phone,
    generalPrice: record.generalPrice,
    sensitivePrice: record.sensitivePrice,
    da: record.da,
    dr: record.dr,
    backlinks: record.backlinks,
    trustFlow: record.trustFlow,
    language: record.language,
    region: record.region,
    niche: record.niche,
    monthlyTraffic: record.monthlyTraffic,
    turnaroundDays: record.turnaroundDays,
    placementType: record.placementType,
    linkAttribute: record.linkAttribute,
    status: record.status,
    verified: record.verified,
    note: record.note,
  };
}

export function AdminDashboard() {
  const { records, hydrated, addRecord, updateRecord, deleteRecord } = useWebsiteRecords();
  const [formState, setFormState] = useState<WebsiteRecordInput>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);

  const summary = useMemo(() => {
    const totalRecords = records.length;
    const availableRecords = records.filter((record) => record.status === "available").length;
    const averageGeneralPrice = totalRecords
      ? records.reduce((total, record) => total + record.generalPrice, 0) / totalRecords
      : 0;
    const averageAuthority = totalRecords
      ? records.reduce((total, record) => total + record.da + record.dr, 0) / (totalRecords * 2)
      : 0;

    return {
      totalRecords,
      availableRecords,
      averageGeneralPrice,
      averageAuthority,
    };
  }, [records]);

  const handleFieldChange = (event: ChangeEvent<FormField>) => {
    const field = event.target.name as keyof WebsiteRecordInput;

    setFormState((current) => {
      if (event.target instanceof HTMLInputElement && event.target.type === "checkbox") {
        return {
          ...current,
          [field]: event.target.checked,
        };
      }

      if (event.target instanceof HTMLInputElement && event.target.type === "number") {
        return {
          ...current,
          [field]: Number(event.target.value),
        };
      }

      return {
        ...current,
        [field]: event.target.value,
      };
    });
  };

  const resetForm = () => {
    setFormState(initialFormState);
    setEditingId(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingId) {
      updateRecord(editingId, formState);
    } else {
      addRecord(formState);
    }

    resetForm();
  };

  const handleEdit = (record: WebsiteRecord) => {
    setEditingId(record.id);
    setFormState(mapRecordToFormState(record));
  };

  return (
    <div className="page-stack">
      <section className="hero card-gradient">
        <div>
          <p className="eyebrow">Admin workspace</p>
          <h1>Manage partner websites, pricing tiers, and outreach notes in one place.</h1>
          <p className="section-copy">
            This dashboard lets admins curate inventory for link building campaigns while
            clients browse clean, verified listings on the marketplace page.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <span>Total websites</span>
            <strong>{summary.totalRecords}</strong>
          </div>
          <div className="metric-card">
            <span>Available today</span>
            <strong>{summary.availableRecords}</strong>
          </div>
          <div className="metric-card">
            <span>Avg. general price</span>
            <strong>{currencyFormatter.format(summary.averageGeneralPrice)}</strong>
          </div>
          <div className="metric-card">
            <span>Avg. authority</span>
            <strong>{summary.averageAuthority.toFixed(1)}</strong>
          </div>
        </div>
      </section>

      <section className="content-grid two-column">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Website form</p>
              <h2>{editingId ? "Update website listing" : "Add a new website listing"}</h2>
            </div>
            {editingId ? (
              <button className="secondary-button" onClick={resetForm} type="button">
                Cancel editing
              </button>
            ) : null}
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="field-grid">
              <label>
                Website name
                <input
                  name="websiteName"
                  onChange={handleFieldChange}
                  required
                  type="text"
                  value={formState.websiteName}
                />
              </label>
              <label>
                Website URL
                <input
                  name="url"
                  onChange={handleFieldChange}
                  required
                  type="url"
                  value={formState.url}
                />
              </label>
              <label>
                Owner name
                <input
                  name="ownerName"
                  onChange={handleFieldChange}
                  required
                  type="text"
                  value={formState.ownerName}
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  onChange={handleFieldChange}
                  required
                  type="email"
                  value={formState.email}
                />
              </label>
              <label>
                Phone
                <input
                  name="phone"
                  onChange={handleFieldChange}
                  required
                  type="text"
                  value={formState.phone}
                />
              </label>
              <label>
                Language
                <input
                  name="language"
                  onChange={handleFieldChange}
                  required
                  type="text"
                  value={formState.language}
                />
              </label>
              <label>
                Region
                <input
                  name="region"
                  onChange={handleFieldChange}
                  required
                  type="text"
                  value={formState.region}
                />
              </label>
              <label>
                Niche
                <input
                  name="niche"
                  onChange={handleFieldChange}
                  required
                  type="text"
                  value={formState.niche}
                />
              </label>
              <label>
                General niche price
                <input
                  min="0"
                  name="generalPrice"
                  onChange={handleFieldChange}
                  required
                  type="number"
                  value={formState.generalPrice}
                />
              </label>
              <label>
                Sensitive niche price
                <input
                  min="0"
                  name="sensitivePrice"
                  onChange={handleFieldChange}
                  required
                  type="number"
                  value={formState.sensitivePrice}
                />
              </label>
              <label>
                Domain Authority (DA)
                <input
                  max="100"
                  min="0"
                  name="da"
                  onChange={handleFieldChange}
                  required
                  type="number"
                  value={formState.da}
                />
              </label>
              <label>
                Domain Rating (DR)
                <input
                  max="100"
                  min="0"
                  name="dr"
                  onChange={handleFieldChange}
                  required
                  type="number"
                  value={formState.dr}
                />
              </label>
              <label>
                Backlinks pointing
                <input
                  min="0"
                  name="backlinks"
                  onChange={handleFieldChange}
                  required
                  type="number"
                  value={formState.backlinks}
                />
              </label>
              <label>
                Trust Flow
                <input
                  max="100"
                  min="0"
                  name="trustFlow"
                  onChange={handleFieldChange}
                  required
                  type="number"
                  value={formState.trustFlow}
                />
              </label>
              <label>
                Monthly traffic
                <input
                  min="0"
                  name="monthlyTraffic"
                  onChange={handleFieldChange}
                  required
                  type="number"
                  value={formState.monthlyTraffic}
                />
              </label>
              <label>
                Turnaround days
                <input
                  min="1"
                  name="turnaroundDays"
                  onChange={handleFieldChange}
                  required
                  type="number"
                  value={formState.turnaroundDays}
                />
              </label>
              <label>
                Placement type
                <select name="placementType" onChange={handleFieldChange} value={formState.placementType}>
                  {placementTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Link attribute
                <select name="linkAttribute" onChange={handleFieldChange} value={formState.linkAttribute}>
                  {linkAttributes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select name="status" onChange={handleFieldChange} value={formState.status}>
                  {websiteStatuses.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="checkbox-field">
                <input
                  checked={formState.verified}
                  name="verified"
                  onChange={handleFieldChange}
                  type="checkbox"
                />
                Verified website
              </label>
            </div>

            <label>
              Admin notes
              <textarea
                name="note"
                onChange={handleFieldChange}
                placeholder="Add outreach conditions, niche restrictions, or content guidelines."
                rows={5}
                value={formState.note}
              />
            </label>

            <div className="button-row">
              <button className="primary-button" type="submit">
                {editingId ? "Save changes" : "Create website"}
              </button>
              <button className="secondary-button" onClick={resetForm} type="button">
                Reset form
              </button>
            </div>
          </form>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Managed inventory</p>
              <h2>Current website listings</h2>
            </div>
            <span className="pill">
              {hydrated ? "Live browser storage" : "Loading inventory..."}
            </span>
          </div>

          <div className="listing-stack">
            {records.map((record) => (
              <div className="listing-card" key={record.id}>
                <div className="listing-header">
                  <div>
                    <h3>{record.websiteName}</h3>
                    <a href={record.url} rel="noreferrer" target="_blank">
                      {record.url}
                    </a>
                  </div>
                  <div className="listing-actions">
                    <span className={`status-badge status-${record.status}`}>{record.status}</span>
                    {record.verified ? <span className="pill">Verified</span> : null}
                  </div>
                </div>

                <div className="stats-grid compact">
                  <div>
                    <span>Owner</span>
                    <strong>{record.ownerName}</strong>
                  </div>
                  <div>
                    <span>General</span>
                    <strong>{currencyFormatter.format(record.generalPrice)}</strong>
                  </div>
                  <div>
                    <span>Sensitive</span>
                    <strong>{currencyFormatter.format(record.sensitivePrice)}</strong>
                  </div>
                  <div>
                    <span>DA / DR</span>
                    <strong>
                      {record.da} / {record.dr}
                    </strong>
                  </div>
                  <div>
                    <span>Backlinks</span>
                    <strong>{compactNumberFormatter.format(record.backlinks)}</strong>
                  </div>
                  <div>
                    <span>Region</span>
                    <strong>{record.region}</strong>
                  </div>
                </div>

                <p className="note-block">{record.note}</p>

                <div className="button-row">
                  <button className="secondary-button" onClick={() => handleEdit(record)} type="button">
                    Edit
                  </button>
                  <button
                    className="danger-button"
                    onClick={() => deleteRecord(record.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
