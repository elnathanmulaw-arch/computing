const STORAGE_KEY = "link-building-websites-v1";

const seedWebsites = [
  {
    id: "w-1",
    websiteName: "MarketPulse Daily",
    url: "https://marketpulse.example",
    ownerName: "Ava Bennett",
    email: "ava@marketpulse.example",
    phone: "+1-555-0131",
    priceGeneral: 140,
    priceSensitive: 220,
    da: 54,
    dr: 61,
    backlinksPointing: 12600,
    trustFlow: 39,
    language: "English",
    region: "North America",
    nicheType: "Mixed",
    note: "Sponsored post live within 72 hours.",
  },
  {
    id: "w-2",
    websiteName: "Global Startup Lens",
    url: "https://startuplens.example",
    ownerName: "Liam Ortega",
    email: "liam@startuplens.example",
    phone: "+44-20-5550-0122",
    priceGeneral: 95,
    priceSensitive: 170,
    da: 47,
    dr: 52,
    backlinksPointing: 7800,
    trustFlow: 31,
    language: "English",
    region: "Europe",
    nicheType: "General",
    note: "Accepts SaaS, marketing, and tech only.",
  },
];

const state = {
  websites: [],
};

const refs = {
  adminView: document.getElementById("admin-view"),
  clientView: document.getElementById("client-view"),
  adminViewBtn: document.getElementById("admin-view-btn"),
  clientViewBtn: document.getElementById("client-view-btn"),
  summaryCards: document.getElementById("summary-cards"),
  form: document.getElementById("website-form"),
  resetBtn: document.getElementById("reset-btn"),
  saveBtn: document.getElementById("save-btn"),
  adminTableBody: document.getElementById("admin-table-body"),
  clientTableBody: document.getElementById("client-table-body"),
  emptyRowTemplate: document.getElementById("empty-row-template"),
  filters: {
    search: document.getElementById("client-search"),
    niche: document.getElementById("client-niche"),
    language: document.getElementById("client-language"),
    region: document.getElementById("client-region"),
    minDa: document.getElementById("client-min-da"),
    maxPrice: document.getElementById("client-max-price"),
  },
};

const formFields = {
  id: document.getElementById("website-id"),
  websiteName: document.getElementById("website-name"),
  url: document.getElementById("website-url"),
  ownerName: document.getElementById("owner-name"),
  email: document.getElementById("owner-email"),
  phone: document.getElementById("owner-phone"),
  priceGeneral: document.getElementById("price-general"),
  priceSensitive: document.getElementById("price-sensitive"),
  da: document.getElementById("da"),
  dr: document.getElementById("dr"),
  backlinksPointing: document.getElementById("backlinks"),
  trustFlow: document.getElementById("trust-flow"),
  language: document.getElementById("language"),
  region: document.getElementById("region"),
  nicheType: document.getElementById("niche-type"),
  note: document.getElementById("note"),
};

function loadWebsites() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.websites = [...seedWebsites];
    persist();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      state.websites = parsed;
      return;
    }
  } catch (error) {
    console.error("Unable to parse stored websites.", error);
  }

  state.websites = [...seedWebsites];
  persist();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.websites));
}

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function average(items, key) {
  if (!items.length) return 0;
  const total = items.reduce((sum, item) => sum + Number(item[key] || 0), 0);
  return Math.round(total / items.length);
}

function total(items, key) {
  return items.reduce((sum, item) => sum + Number(item[key] || 0), 0);
}

function renderSummary() {
  const cards = [
    { label: "Total Websites", value: state.websites.length },
    { label: "Average DA", value: average(state.websites, "da") },
    { label: "Average DR", value: average(state.websites, "dr") },
    { label: "Backlinks Pointing", value: total(state.websites, "backlinksPointing").toLocaleString() },
    { label: "Avg General Price", value: currency(average(state.websites, "priceGeneral")) },
    { label: "Avg Sensitive Price", value: currency(average(state.websites, "priceSensitive")) },
  ];

  refs.summaryCards.innerHTML = cards
    .map(
      (card) => `
      <article class="summary-card">
        <p>${card.label}</p>
        <h3>${card.value}</h3>
      </article>
    `
    )
    .join("");
}

function renderAdminTable() {
  if (!state.websites.length) {
    refs.adminTableBody.innerHTML = buildEmptyRow(12);
    return;
  }

  refs.adminTableBody.innerHTML = state.websites
    .map(
      (site) => `
      <tr>
        <td><a href="${site.url}" target="_blank" rel="noreferrer">${escapeHtml(site.websiteName)}</a></td>
        <td>
          ${escapeHtml(site.ownerName)}<br />
          <small>${escapeHtml(site.email)}<br />${escapeHtml(site.phone)}</small>
        </td>
        <td>${currency(site.priceGeneral)}</td>
        <td>${currency(site.priceSensitive)}</td>
        <td>${site.da} / ${site.dr}</td>
        <td>${Number(site.backlinksPointing).toLocaleString()}</td>
        <td>${site.trustFlow}</td>
        <td>${escapeHtml(site.language)}</td>
        <td>${escapeHtml(site.region)}</td>
        <td>${nicheChip(site.nicheType)}</td>
        <td>${escapeHtml(site.note || "-")}</td>
        <td>
          <div class="table-actions">
            <button type="button" data-action="edit" data-id="${site.id}">Edit</button>
            <button class="delete" type="button" data-action="delete" data-id="${site.id}">Delete</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

function buildEmptyRow(colspan) {
  const templateRow = refs.emptyRowTemplate.content.firstElementChild.cloneNode(true);
  templateRow.firstElementChild.colSpan = colspan;
  return templateRow.outerHTML;
}

function nicheChip(nicheType) {
  const cls = nicheType.toLowerCase();
  return `<span class="chip ${cls}">${escapeHtml(nicheType)}</span>`;
}

function populateFilters() {
  const languages = uniqueValues("language");
  const regions = uniqueValues("region");

  replaceFilterOptions(refs.filters.language, languages);
  replaceFilterOptions(refs.filters.region, regions);
}

function uniqueValues(field) {
  return [...new Set(state.websites.map((site) => site[field]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function replaceFilterOptions(selectElement, values) {
  const current = selectElement.value;
  selectElement.innerHTML = `<option value="All">All</option>${values
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join("")}`;
  if ([...selectElement.options].some((option) => option.value === current)) {
    selectElement.value = current;
  }
}

function getClientFilteredWebsites() {
  const query = refs.filters.search.value.trim().toLowerCase();
  const niche = refs.filters.niche.value;
  const language = refs.filters.language.value;
  const region = refs.filters.region.value;
  const minDa = Number(refs.filters.minDa.value || 0);
  const maxPriceRaw = refs.filters.maxPrice.value.trim();
  const hasPriceCap = maxPriceRaw !== "";
  const maxPrice = Number(maxPriceRaw);

  return state.websites.filter((site) => {
    const text = `${site.websiteName} ${site.url} ${site.ownerName} ${site.email}`.toLowerCase();
    if (query && !text.includes(query)) return false;
    if (niche !== "All" && site.nicheType !== niche) return false;
    if (language !== "All" && site.language !== language) return false;
    if (region !== "All" && site.region !== region) return false;
    if (Number(site.da) < minDa) return false;
    if (hasPriceCap && Number(site.priceGeneral) > maxPrice) return false;
    return true;
  });
}

function renderClientTable() {
  const websites = getClientFilteredWebsites();
  if (!websites.length) {
    refs.clientTableBody.innerHTML = buildEmptyRow(15);
    return;
  }

  refs.clientTableBody.innerHTML = websites
    .map(
      (site) => `
      <tr>
        <td>${escapeHtml(site.websiteName)}</td>
        <td><a href="${site.url}" target="_blank" rel="noreferrer">${escapeHtml(site.url)}</a></td>
        <td>${escapeHtml(site.ownerName)}</td>
        <td><a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a></td>
        <td>${escapeHtml(site.phone)}</td>
        <td>${currency(site.priceGeneral)}</td>
        <td>${currency(site.priceSensitive)}</td>
        <td>${site.da}</td>
        <td>${site.dr}</td>
        <td>${Number(site.backlinksPointing).toLocaleString()}</td>
        <td>${site.trustFlow}</td>
        <td>${escapeHtml(site.language)}</td>
        <td>${escapeHtml(site.region)}</td>
        <td>${nicheChip(site.nicheType)}</td>
        <td>${escapeHtml(site.note || "-")}</td>
      </tr>
    `
    )
    .join("");
}

function clearForm() {
  refs.form.reset();
  formFields.id.value = "";
  refs.saveBtn.textContent = "Save Website";
}

function setView(view) {
  const admin = view === "admin";
  refs.adminView.classList.toggle("hidden", !admin);
  refs.clientView.classList.toggle("hidden", admin);
  refs.adminViewBtn.classList.toggle("active", admin);
  refs.clientViewBtn.classList.toggle("active", !admin);
}

function upsertWebsite(payload) {
  const index = state.websites.findIndex((site) => site.id === payload.id);
  if (index >= 0) {
    state.websites[index] = payload;
  } else {
    state.websites.unshift(payload);
  }
  persist();
}

function getFormValues() {
  const payload = {
    id: formFields.id.value || `w-${Date.now()}`,
    websiteName: formFields.websiteName.value.trim(),
    url: formFields.url.value.trim(),
    ownerName: formFields.ownerName.value.trim(),
    email: formFields.email.value.trim(),
    phone: formFields.phone.value.trim(),
    priceGeneral: Number(formFields.priceGeneral.value),
    priceSensitive: Number(formFields.priceSensitive.value),
    da: Number(formFields.da.value),
    dr: Number(formFields.dr.value),
    backlinksPointing: Number(formFields.backlinksPointing.value),
    trustFlow: Number(formFields.trustFlow.value),
    language: formFields.language.value.trim(),
    region: formFields.region.value.trim(),
    nicheType: formFields.nicheType.value,
    note: formFields.note.value.trim(),
  };

  validatePayload(payload);
  return payload;
}

function validatePayload(payload) {
  if (payload.priceSensitive < payload.priceGeneral) {
    throw new Error("Sensitive niche price should be greater than or equal to general niche price.");
  }
  if (payload.da > 100 || payload.dr > 100 || payload.trustFlow > 100) {
    throw new Error("DA, DR, and Trust Flow should be 100 or below.");
  }
  if (!payload.websiteName || !payload.url || !payload.ownerName || !payload.email) {
    throw new Error("Please fill all required fields.");
  }
}

function fillForm(website) {
  Object.entries(formFields).forEach(([field, element]) => {
    if (website[field] !== undefined) {
      element.value = website[field];
    }
  });
  refs.saveBtn.textContent = "Update Website";
}

function onFormSubmit(event) {
  event.preventDefault();
  try {
    const payload = getFormValues();
    upsertWebsite(payload);
    renderAll();
    clearForm();
  } catch (error) {
    alert(error.message);
  }
}

function onAdminTableClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const id = target.dataset.id;
  const action = target.dataset.action;
  if (!id || !action) return;

  const website = state.websites.find((site) => site.id === id);
  if (!website) return;

  if (action === "edit") {
    fillForm(website);
    refs.adminView.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm(`Delete ${website.websiteName}?`);
    if (!confirmed) return;
    state.websites = state.websites.filter((site) => site.id !== id);
    persist();
    renderAll();
    clearForm();
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderAll() {
  renderSummary();
  renderAdminTable();
  populateFilters();
  renderClientTable();
}

function attachEvents() {
  refs.form.addEventListener("submit", onFormSubmit);
  refs.resetBtn.addEventListener("click", clearForm);
  refs.adminTableBody.addEventListener("click", onAdminTableClick);
  refs.adminViewBtn.addEventListener("click", () => setView("admin"));
  refs.clientViewBtn.addEventListener("click", () => setView("client"));

  Object.values(refs.filters).forEach((element) =>
    element.addEventListener("input", renderClientTable)
  );
}

function init() {
  loadWebsites();
  attachEvents();
  renderAll();
}

init();
