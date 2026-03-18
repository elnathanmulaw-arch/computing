const API_BASE = "/api";
const TOKEN_KEY = "lb_saas_token";

const state = {
  token: localStorage.getItem(TOKEN_KEY) || "",
  user: null,
  websites: [],
  stats: null,
  editingId: null,
};

const refs = {
  authSection: document.getElementById("auth-section"),
  appSection: document.getElementById("app-section"),
  loginForm: document.getElementById("login-form"),
  registerForm: document.getElementById("register-form"),
  logoutBtn: document.getElementById("logout-btn"),
  userBadge: document.getElementById("user-badge"),
  summaryCards: document.getElementById("summary-cards"),
  adminPanel: document.getElementById("admin-panel"),
  websiteForm: document.getElementById("website-form"),
  clearWebsiteBtn: document.getElementById("clear-website-btn"),
  saveWebsiteBtn: document.getElementById("save-website-btn"),
  adminTableBody: document.getElementById("admin-table-body"),
  clientTableBody: document.getElementById("client-table-body"),
  filterSearch: document.getElementById("search"),
  filterNiche: document.getElementById("filter-niche"),
  filterLanguage: document.getElementById("filter-language"),
  filterRegion: document.getElementById("filter-region"),
  filterMinDa: document.getElementById("filter-min-da"),
  filterMaxPrice: document.getElementById("filter-max-price"),
  applyFiltersBtn: document.getElementById("apply-filters-btn"),
  clearFiltersBtn: document.getElementById("clear-filters-btn"),
  toast: document.getElementById("toast"),
};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function showToast(message, isError = false) {
  refs.toast.textContent = message;
  refs.toast.classList.remove("hidden");
  refs.toast.classList.toggle("danger", isError);
  window.setTimeout(() => refs.toast.classList.add("hidden"), 3000);
}

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const hasJson = contentType.includes("application/json");
  const payload = hasJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401 && state.token) {
      clearSession();
      setView();
    }
    throw new Error(payload?.error || `Request failed (${response.status})`);
  }

  return payload;
}

function clearSession() {
  state.token = "";
  state.user = null;
  localStorage.removeItem(TOKEN_KEY);
}

function setView() {
  const isAuthed = Boolean(state.user);
  refs.authSection.classList.toggle("hidden", isAuthed);
  refs.appSection.classList.toggle("hidden", !isAuthed);

  if (!isAuthed) {
    return;
  }

  refs.userBadge.textContent = `${state.user.name} (${state.user.role})`;
  refs.adminPanel.classList.toggle("hidden", state.user.role !== "admin");
}

function mapWebsitePayloadFromForm() {
  const formData = new FormData(refs.websiteForm);
  const payload = Object.fromEntries(formData.entries());

  return {
    websiteName: payload.websiteName.trim(),
    url: payload.url.trim(),
    ownerName: payload.ownerName.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    priceGeneral: Number(payload.priceGeneral),
    priceSensitive: Number(payload.priceSensitive),
    da: Number(payload.da),
    dr: Number(payload.dr),
    backlinksPointing: Number(payload.backlinksPointing),
    trustFlow: Number(payload.trustFlow),
    language: payload.language.trim(),
    region: payload.region.trim(),
    nicheType: payload.nicheType,
    note: payload.note.trim(),
  };
}

function resetWebsiteForm() {
  state.editingId = null;
  refs.websiteForm.reset();
  refs.saveWebsiteBtn.textContent = "Save Website";
}

function renderSummary() {
  const stats = state.stats || {
    totalWebsites: 0,
    avgDa: 0,
    avgDr: 0,
    totalBacklinksPointing: 0,
    avgGeneralPrice: 0,
    avgSensitivePrice: 0,
  };

  const cards = [
    ["Total Websites", stats.totalWebsites],
    ["Average DA", stats.avgDa],
    ["Average DR", stats.avgDr],
    ["Backlinks Pointing", Number(stats.totalBacklinksPointing).toLocaleString()],
    ["Avg General Price", formatCurrency(stats.avgGeneralPrice)],
    ["Avg Sensitive Price", formatCurrency(stats.avgSensitivePrice)],
  ];

  refs.summaryCards.innerHTML = cards
    .map(
      ([title, value]) => `
      <article class="summary-card">
        <p>${title}</p>
        <h4>${value}</h4>
      </article>
    `
    )
    .join("");
}

function renderAdminTable() {
  if (!state.websites.length) {
    refs.adminTableBody.innerHTML = `<tr><td colspan="12" class="muted">No websites found.</td></tr>`;
    return;
  }

  refs.adminTableBody.innerHTML = state.websites
    .map(
      (site) => `
        <tr>
          <td><a href="${site.url}" target="_blank" rel="noreferrer">${escapeHtml(site.websiteName)}</a></td>
          <td>${escapeHtml(site.ownerName)}<br /><small>${escapeHtml(site.email)}<br />${escapeHtml(
            site.phone
          )}</small></td>
          <td>${formatCurrency(site.priceGeneral)}</td>
          <td>${formatCurrency(site.priceSensitive)}</td>
          <td>${site.da}/${site.dr}</td>
          <td>${Number(site.backlinksPointing).toLocaleString()}</td>
          <td>${site.trustFlow}</td>
          <td>${escapeHtml(site.language)}</td>
          <td>${escapeHtml(site.region)}</td>
          <td>${escapeHtml(site.nicheType)}</td>
          <td>${escapeHtml(site.note || "-")}</td>
          <td class="inline-actions">
            <button type="button" data-action="edit" data-id="${site.id}">Edit</button>
            <button type="button" data-action="delete" data-id="${site.id}" class="secondary">Delete</button>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderClientTable() {
  if (!state.websites.length) {
    refs.clientTableBody.innerHTML = `<tr><td colspan="15" class="muted">No websites found.</td></tr>`;
    return;
  }

  refs.clientTableBody.innerHTML = state.websites
    .map(
      (site) => `
      <tr>
        <td>${escapeHtml(site.websiteName)}</td>
        <td><a href="${site.url}" target="_blank" rel="noreferrer">${escapeHtml(site.url)}</a></td>
        <td>${escapeHtml(site.ownerName)}</td>
        <td><a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a></td>
        <td>${escapeHtml(site.phone)}</td>
        <td>${formatCurrency(site.priceGeneral)}</td>
        <td>${formatCurrency(site.priceSensitive)}</td>
        <td>${site.da}</td>
        <td>${site.dr}</td>
        <td>${Number(site.backlinksPointing).toLocaleString()}</td>
        <td>${site.trustFlow}</td>
        <td>${escapeHtml(site.language)}</td>
        <td>${escapeHtml(site.region)}</td>
        <td>${escapeHtml(site.nicheType)}</td>
        <td>${escapeHtml(site.note || "-")}</td>
      </tr>
    `
    )
    .join("");
}

function render() {
  setView();
  if (!state.user) {
    return;
  }
  renderSummary();
  if (state.user.role === "admin") {
    renderAdminTable();
  }
  renderClientTable();
}

function buildWebsiteQuery() {
  const params = new URLSearchParams({ page: "1", limit: "100" });
  const values = {
    search: refs.filterSearch.value.trim(),
    niche: refs.filterNiche.value.trim(),
    language: refs.filterLanguage.value.trim(),
    region: refs.filterRegion.value.trim(),
    minDa: refs.filterMinDa.value.trim(),
    maxPrice: refs.filterMaxPrice.value.trim(),
  };

  Object.entries(values).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params.toString();
}

async function fetchWebsites() {
  const query = buildWebsiteQuery();
  const response = await apiFetch(`/websites?${query}`);
  state.websites = response.data || [];
}

async function fetchStats() {
  state.stats = await apiFetch("/websites/stats");
}

async function refreshDashboard() {
  await Promise.all([fetchWebsites(), fetchStats()]);
  render();
}

async function onLoginSubmit(event) {
  event.preventDefault();
  const formData = new FormData(refs.loginForm);
  try {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: String(formData.get("email") || "").trim(),
        password: String(formData.get("password") || ""),
      }),
    });
    state.token = response.token;
    state.user = response.user;
    localStorage.setItem(TOKEN_KEY, state.token);
    await refreshDashboard();
    showToast("Logged in successfully.");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function onRegisterSubmit(event) {
  event.preventDefault();
  const formData = new FormData(refs.registerForm);
  try {
    const response = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        password: String(formData.get("password") || ""),
        role: String(formData.get("role") || "client"),
        adminInviteCode: String(formData.get("adminInviteCode") || "").trim(),
      }),
    });
    state.token = response.token;
    state.user = response.user;
    localStorage.setItem(TOKEN_KEY, state.token);
    await refreshDashboard();
    showToast("Account created.");
  } catch (error) {
    showToast(error.message, true);
  }
}

function onLogout() {
  clearSession();
  render();
  showToast("Logged out.");
}

async function onWebsiteSubmit(event) {
  event.preventDefault();
  if (state.user?.role !== "admin") {
    return;
  }

  const payload = mapWebsitePayloadFromForm();
  try {
    if (state.editingId) {
      await apiFetch(`/websites/${state.editingId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showToast("Website updated.");
    } else {
      await apiFetch("/websites", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showToast("Website created.");
    }

    resetWebsiteForm();
    await refreshDashboard();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function onAdminTableClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.dataset.action;
  const id = Number(target.dataset.id);
  if (!action || !id) return;

  const website = state.websites.find((item) => item.id === id);
  if (!website) return;

  if (action === "edit") {
    state.editingId = id;
    refs.saveWebsiteBtn.textContent = "Update Website";
    Object.entries(website).forEach(([key, value]) => {
      const input = refs.websiteForm.elements.namedItem(key);
      if (input && "value" in input) {
        input.value = value;
      }
    });
    refs.websiteForm.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm(`Delete ${website.websiteName}?`);
    if (!confirmed) return;

    try {
      await apiFetch(`/websites/${id}`, { method: "DELETE" });
      showToast("Website deleted.");
      await refreshDashboard();
    } catch (error) {
      showToast(error.message, true);
    }
  }
}

async function onApplyFilters() {
  try {
    await fetchWebsites();
    render();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function onClearFilters() {
  refs.filterSearch.value = "";
  refs.filterNiche.value = "";
  refs.filterLanguage.value = "";
  refs.filterRegion.value = "";
  refs.filterMinDa.value = "";
  refs.filterMaxPrice.value = "";
  await onApplyFilters();
}

function attachEvents() {
  refs.loginForm.addEventListener("submit", onLoginSubmit);
  refs.registerForm.addEventListener("submit", onRegisterSubmit);
  refs.logoutBtn.addEventListener("click", onLogout);
  refs.websiteForm.addEventListener("submit", onWebsiteSubmit);
  refs.clearWebsiteBtn.addEventListener("click", resetWebsiteForm);
  refs.adminTableBody.addEventListener("click", onAdminTableClick);
  refs.applyFiltersBtn.addEventListener("click", onApplyFilters);
  refs.clearFiltersBtn.addEventListener("click", onClearFilters);
}

async function bootstrapSession() {
  if (!state.token) {
    render();
    return;
  }

  try {
    const response = await apiFetch("/auth/me");
    state.user = response.user;
    await refreshDashboard();
  } catch (error) {
    clearSession();
    render();
    showToast("Session expired, please login again.", true);
  }
}

async function init() {
  attachEvents();
  await bootstrapSession();
}

init();
