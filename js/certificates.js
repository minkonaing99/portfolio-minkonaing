const CERTIFICATE_PROVIDERS = Object.freeze({
  meta: Object.freeze({
    key: "meta",
    label: "Meta",
    iconType: "image",
    icon: "assets/svg/certificates/meta.svg",
  }),
  coursera: Object.freeze({
    key: "coursera",
    label: "Coursera",
    iconType: "image",
    icon: "assets/svg/certificates/coursera.svg",
  }),
  mikrotik: Object.freeze({
    key: "mikrotik",
    label: "MikroTik",
    iconType: "image",
    icon: "assets/svg/certificates/mikrotik.svg",
  }),
  google: Object.freeze({
    key: "google",
    label: "Google",
    iconType: "image",
    icon: "assets/svg/certificates/google.svg",
  }),
  codelab: Object.freeze({
    key: "codelab",
    label: "Codelab",
    iconType: "image",
    icon: "assets/images/certificates/codelab-logo.jpg",
  }),
  "british-council": Object.freeze({
    key: "british-council",
    label: "British Council",
    iconType: "image",
    icon: "assets/svg/certificates/british-council.svg",
  }),
  credential: Object.freeze({
    key: "credential",
    label: "Other credentials",
    iconType: "font-awesome",
    icon: "fa-solid fa-award",
  }),
});

const CERTIFICATE_HOSTNAMES = Object.freeze([
  "coursera.org",
  "www.coursera.org",
  "mikrotik.com",
  "www.mikrotik.com",
  "codelab.com",
  "www.codelab.com",
  "ielts.org",
  "www.ielts.org",
]);

let certificateGroups = Object.freeze([]);
let activeCertificateTrigger = null;
let certificateDialogTimer = null;
const CERTIFICATE_DIALOG_TIMEOUT_MS = 10000;

async function loadCertificatesData() {
  try {
    const response = await fetch("data/certificates.json");
    if (!response.ok) throw new Error(`Certificate request failed: ${response.status}`);
    const certificates = await response.json();
    if (!Array.isArray(certificates)) throw new TypeError("Certificate data must be an array");
    displayCertificates(certificates);
  } catch (error) {
    console.error("Error loading certificates:", error);
  }
}

function getCertificateProvider(providerKey) {
  const safeKey = typeof providerKey === "string" ? providerKey : "";
  const provider = Object.hasOwn(CERTIFICATE_PROVIDERS, safeKey)
    ? CERTIFICATE_PROVIDERS[safeKey]
    : CERTIFICATE_PROVIDERS.credential;
  return Object.freeze({ ...provider });
}

function cleanCertificateText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, 160) || fallback;
}

function getSafeCertificateUrl(value) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    const hasCredentials = Boolean(url.username || url.password);
    const trustedHost = CERTIFICATE_HOSTNAMES.includes(url.hostname);
    if (url.protocol !== "https:" || url.port || hasCredentials || !trustedHost) return "";
    return url.href;
  } catch {
    return "";
  }
}

function normalizeCertificate(certificate) {
  const source = certificate && typeof certificate === "object" ? certificate : {};
  return Object.freeze({
    title: cleanCertificateText(source.certificate, "Professional certificate"),
    issuer: cleanCertificateText(source.issurer, "Credential provider"),
    year: cleanCertificateText(source.year, ""),
    provider: getCertificateProvider(source.provider),
    verifyUrl: getSafeCertificateUrl(source.url),
  });
}

function groupCertificates(certificates) {
  if (!Array.isArray(certificates)) return Object.freeze([]);
  const normalized = certificates.map(normalizeCertificate);
  const providerKeys = [...new Set(normalized.map((item) => item.provider.key))];
  const groups = providerKeys.map((providerKey) => {
    const related = normalized.filter((item) => item.provider.key === providerKey);
    return Object.freeze({
      provider: getCertificateProvider(providerKey),
      certificates: Object.freeze([...related]),
    });
  });
  return Object.freeze(groups);
}

function createCertificateIcon(provider) {
  const container = document.createElement("span");
  container.className = `certificate-provider-icon certificate-provider-${provider.key}`;
  container.setAttribute("aria-hidden", "true");

  if (provider.iconType === "image") {
    const image = document.createElement("img");
    image.setAttribute("src", provider.icon);
    image.setAttribute("alt", "");
    image.setAttribute("width", "32");
    image.setAttribute("height", "32");
    image.setAttribute("loading", "lazy");
    image.setAttribute("decoding", "async");
    container.appendChild(image);
  } else {
    const icon = document.createElement("i");
    icon.className = provider.icon;
    container.appendChild(icon);
  }

  return container;
}

function createCertificateListItem(certificate) {
  const item = document.createElement("li");
  const copy = document.createElement("div");
  const title = document.createElement("h4");
  const meta = document.createElement("p");
  const issuer = document.createElement("span");
  const year = document.createElement("span");

  item.className = "certificate-detail-item";
  copy.className = "certificate-item-copy";
  title.className = "certificate-name";
  meta.className = "certificate-item-meta";
  issuer.className = "certificate-item-issuer";
  year.className = "certificate-item-year";
  title.textContent = certificate.title;
  issuer.textContent = certificate.issuer;
  year.textContent = certificate.year;
  meta.append(issuer, year);
  copy.append(title, meta);
  item.appendChild(copy);

  return item;
}

function renderProviderDialog(group) {
  const dialog = document.getElementById("certificate-dialog");
  if (!dialog || !group) return null;
  const panel = document.createElement("div");
  const header = document.createElement("header");
  const copy = document.createElement("div");
  const kicker = document.createElement("p");
  const title = document.createElement("h3");
  const count = document.createElement("p");
  const close = document.createElement("button");
  const list = document.createElement("ul");

  panel.className = "certificate-dialog-panel";
  header.className = "certificate-dialog-header";
  copy.className = "certificate-dialog-copy";
  kicker.className = "certificate-dialog-kicker";
  title.className = "certificate-dialog-title";
  title.id = "certificate-dialog-title";
  count.className = "certificate-dialog-count";
  count.id = "certificate-dialog-count";
  close.className = "certificate-dialog-close";
  close.setAttribute("type", "button");
  close.setAttribute("aria-label", "Close certificate details");
  close.textContent = "Close";
  list.className = "certificate-detail-list";
  kicker.textContent = "Credential collection";
  title.textContent = group.provider.label;
  const total = group.certificates.length;
  count.textContent = `${total} ${total === 1 ? "certificate" : "certificates"}`;

  copy.append(kicker, title, count);
  header.append(createCertificateIcon(group.provider), copy, close);
  list.append(...group.certificates.map(createCertificateListItem));
  panel.append(header, list);
  dialog.replaceChildren(panel);
  close.addEventListener("click", closeCertificateDialog);
  return close;
}

function getAnchoredDialogPosition(triggerRect, dialogRect, viewport) {
  const gutter = 16;
  const gap = 12;
  const center = triggerRect.left + triggerRect.width / 2;
  const maxLeft = Math.max(gutter, viewport.width - dialogRect.width - gutter);
  const left = Math.min(Math.max(center - dialogRect.width / 2, gutter), maxLeft);
  const below = triggerRect.bottom + gap;
  const above = triggerRect.top - dialogRect.height - gap;
  const maxTop = Math.max(gutter, viewport.height - dialogRect.height - gutter);

  if (below + dialogRect.height <= viewport.height - gutter) {
    return Object.freeze({ left, top: below, placement: "below" });
  }
  if (above >= gutter) {
    return Object.freeze({ left, top: above, placement: "above" });
  }
  return Object.freeze({
    left,
    top: Math.min(Math.max(below, gutter), maxTop),
    placement: "clamped",
  });
}

function positionCertificateDialog(trigger) {
  const dialog = document.getElementById("certificate-dialog");
  if (!dialog || !trigger || typeof trigger.getBoundingClientRect !== "function") return false;
  const position = getAnchoredDialogPosition(
    trigger.getBoundingClientRect(),
    dialog.getBoundingClientRect(),
    { width: window.innerWidth, height: window.innerHeight }
  );
  dialog.style.left = `${Math.round(position.left)}px`;
  dialog.style.top = `${Math.round(position.top)}px`;
  dialog.setAttribute("data-placement", position.placement);
  return true;
}

function cancelCertificateDialogTimer() {
  if (certificateDialogTimer === null) return;
  clearTimeout(certificateDialogTimer);
  certificateDialogTimer = null;
}

function scheduleCertificateDialogClose() {
  cancelCertificateDialogTimer();
  certificateDialogTimer = setTimeout(() => {
    certificateDialogTimer = null;
    closeCertificateDialog();
  }, CERTIFICATE_DIALOG_TIMEOUT_MS);
}

function openCertificateDialog(index, trigger = null) {
  if (!Number.isInteger(index) || !certificateGroups[index]) return false;
  const dialog = document.getElementById("certificate-dialog");
  if (!dialog) return false;
  const close = renderProviderDialog(certificateGroups[index]);
  activeCertificateTrigger = trigger && typeof trigger.focus === "function" ? trigger : null;
  if (!dialog.open) dialog.showModal();
  positionCertificateDialog(activeCertificateTrigger);
  close.focus({ preventScroll: true });
  scheduleCertificateDialogClose();
  return true;
}

function closeCertificateDialog() {
  const dialog = document.getElementById("certificate-dialog");
  cancelCertificateDialogTimer();
  if (!dialog || !dialog.open) return false;
  dialog.close();
  return true;
}

function createProviderButton(group, index) {
  const button = document.createElement("button");
  const label = document.createElement("span");
  const summary = document.createElement("span");
  const count = group.certificates.length;
  const noun = count === 1 ? "certificate" : "certificates";
  button.className = "certificate-provider-button";
  label.className = "certificate-provider-name";
  summary.className = "certificate-provider-count";
  button.setAttribute("type", "button");
  button.setAttribute("aria-label", `View ${count} ${group.provider.label} ${noun}`);
  button.setAttribute("aria-haspopup", "dialog");
  label.textContent = group.provider.label;
  summary.textContent = `${count} ${noun}`;
  button.append(createCertificateIcon(group.provider), label, summary);
  button.addEventListener("click", () => openCertificateDialog(index, button));
  return button;
}

function displayCertificates(certificates) {
  const grid = document.getElementById("certificate-provider-grid");
  if (!grid) return;

  if (!Array.isArray(certificates) || certificates.length === 0) {
    certificateGroups = Object.freeze([]);
    grid.replaceChildren();
    closeCertificateDialog();
    return;
  }

  certificateGroups = groupCertificates(certificates);
  const buttons = certificateGroups.map((group, index) => createProviderButton(group, index));
  grid.replaceChildren(...buttons);
}

function initializeCertificateDialog() {
  const dialog = document.getElementById("certificate-dialog");
  if (!dialog) return;
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeCertificateDialog();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeCertificateDialog();
  });
  dialog.addEventListener("close", () => {
    cancelCertificateDialogTimer();
    if (activeCertificateTrigger) activeCertificateTrigger.focus();
    activeCertificateTrigger = null;
  });
  window.addEventListener("resize", () => {
    if (dialog.open && activeCertificateTrigger) positionCertificateDialog(activeCertificateTrigger);
  });
}

initializeCertificateDialog();
