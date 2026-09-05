import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
    this.className = "";
    this.style = {};
    this.textContent = "";
    this.parentNode = null;
    this.scrollWidth = 900;
    this.open = false;
    this.rect = Object.freeze({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 });
  }

  append(...children) {
    children.forEach((child) => this.appendChild(child));
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  replaceChildren(...children) {
    this.children = [];
    this.append(...children);
  }

  cloneNode(deep = false) {
    const clone = new FakeElement(this.tagName, this.ownerDocument);
    clone.className = this.className;
    clone.textContent = this.textContent;
    clone.style = { ...this.style };
    this.attributes.forEach((value, name) => clone.setAttribute(name, value));
    if (deep) this.children.forEach((child) => clone.appendChild(child.cloneNode(true)));
    return clone;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(type, [...listeners, listener]);
  }

  dispatch(type, event = {}) {
    const completeEvent = {
      type,
      target: this,
      preventDefault() {},
      ...event,
    };
    (this.listeners.get(type) || []).forEach((listener) => listener(completeEvent));
    return completeEvent;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  getBoundingClientRect() {
    return this.rect;
  }

  showModal() {
    this.open = true;
    this.setAttribute("open", "");
  }

  close() {
    this.open = false;
    this.attributes.delete("open");
    this.dispatch("close");
  }

  querySelectorAll(selector) {
    return descendants(this).filter((element) => matchesSelector(element, selector));
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }
}

function descendants(root) {
  return root.children.flatMap((child) => [child, ...descendants(child)]);
}

function matchesSelector(element, selector) {
  if (selector.startsWith(".")) {
    return element.className.split(/\s+/).includes(selector.slice(1));
  }
  return element.tagName === selector.toUpperCase();
}

class FakeDocument {
  constructor() {
    this.body = new FakeElement("body", this);
    this.listeners = new Map();
    this.events = [];
    this.activeElement = this.body;
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(type, [...listeners, listener]);
  }

  dispatchEvent(event) {
    this.events.push(event.type);
    (this.listeners.get(event.type) || []).forEach((listener) => listener(event));
  }

  getElementById(id) {
    return [this.body, ...descendants(this.body)].find((element) => element.id === id) || null;
  }

  querySelector(selector) {
    return this.body.querySelector(selector);
  }
}

function createFixture() {
  const document = new FakeDocument();
  const grid = document.createElement("div");
  grid.id = "certificate-provider-grid";
  const dialog = document.createElement("dialog");
  dialog.id = "certificate-dialog";
  document.body.append(grid, dialog);
  return { document, grid, dialog };
}

function certificate(overrides = {}) {
  return {
    certificate: "Meta Front-End Developer",
    issurer: "Coursera",
    year: "2025",
    provider: "meta",
    url: "https://coursera.org/verify/META-FRONTEND",
    ...overrides,
  };
}

const { document, grid, dialog } = createFixture();
const loggedErrors = [];
const windowListeners = new Map();
const timers = new Map();
let nextTimerId = 0;
const fakeWindow = {
  innerWidth: 1000,
  innerHeight: 800,
  matchMedia: () => ({ matches: false }),
  addEventListener(type, listener) {
    const listeners = windowListeners.get(type) || [];
    windowListeners.set(type, [...listeners, listener]);
  },
  dispatch(type) {
    (windowListeners.get(type) || []).forEach((listener) => listener({ type }));
  },
};
const source = await readFile(new URL("../js/certificates.js", import.meta.url), "utf8");
const certificateData = JSON.parse(
  await readFile(new URL("../data/certificates.json", import.meta.url), "utf8")
);
const context = vm.createContext({
  URL,
  document,
  Event: class Event {
    constructor(type) {
      this.type = type;
    }
  },
  fetch: async () => ({ ok: true, json: async () => [] }),
  setTimeout(callback, delay) {
    nextTimerId += 1;
    timers.set(nextTimerId, { callback, delay });
    return nextTimerId;
  },
  clearTimeout(timerId) {
    timers.delete(timerId);
  },
  window: fakeWindow,
  console: {
    error(...args) {
      loggedErrors.push(args);
    },
  },
});

vm.runInContext(`${source}
globalThis.certificateTestApi = {
  getCertificateProvider, getSafeCertificateUrl, normalizeCertificate,
  groupCertificates, createProviderButton, createCertificateListItem,
  renderProviderDialog, openCertificateDialog, closeCertificateDialog,
  getAnchoredDialogPosition, positionCertificateDialog,
  scheduleCertificateDialogClose, cancelCertificateDialogTimer,
  displayCertificates, loadCertificatesData,
};`, context, { filename: new URL("../js/certificates.js", import.meta.url).pathname });

const api = context.certificateTestApi;

function getOnlyTimer() {
  assert.equal(timers.size, 1);
  return [...timers.entries()][0];
}

function runTimer(timerId) {
  const timer = timers.get(timerId);
  timers.delete(timerId);
  timer.callback();
}

test("normalizes certificate data without mutating the source", () => {
  const sourceCertificate = certificate();
  const normalized = api.normalizeCertificate(sourceCertificate);

  assert.notEqual(normalized, sourceCertificate);
  assert.equal(normalized.title, "Meta Front-End Developer");
  assert.equal(normalized.issuer, "Coursera");
  assert.equal(normalized.provider.key, "meta");
  assert.equal(normalized.verifyUrl, "https://coursera.org/verify/META-FRONTEND");
  assert.deepEqual(sourceCertificate, certificate());
});

test("uses a safe neutral provider for unknown provider keys", () => {
  const provider = api.getCertificateProvider("../../bad-path");
  const inheritedProvider = api.getCertificateProvider("constructor");

  assert.equal(provider.key, "credential");
  assert.equal(provider.iconType, "font-awesome");
  assert.equal(provider.icon, "fa-solid fa-award");
  assert.equal(inheritedProvider.key, "credential");
});

test("supplies safe text defaults for malformed certificate records", () => {
  const normalized = api.normalizeCertificate(null);

  assert.equal(normalized.title, "Professional certificate");
  assert.equal(normalized.issuer, "Credential provider");
  assert.equal(normalized.year, "");
  assert.equal(api.getCertificateProvider(null).key, "credential");
});

test("accepts only trusted HTTPS certificate verification URLs", () => {
  assert.equal(api.getSafeCertificateUrl("https://coursera.org/verify/abc"), "https://coursera.org/verify/abc");
  assert.equal(api.getSafeCertificateUrl("http://coursera.org/verify/abc"), "");
  assert.equal(api.getSafeCertificateUrl("javascript:alert(1)"), "");
  assert.equal(api.getSafeCertificateUrl("https://coursera.org.evil.test/verify"), "");
  assert.equal(api.getSafeCertificateUrl("https://user:pass@coursera.org/verify"), "");
  assert.equal(api.getSafeCertificateUrl("https://coursera.org:8443/verify"), "");
  assert.equal(api.getSafeCertificateUrl("not a url"), "");
});

test("groups certificates by credential brand without source mutation", () => {
  const before = structuredClone(certificateData);
  const groups = api.groupCertificates(certificateData);
  const meta = groups.find((group) => group.provider.key === "meta");
  const google = groups.find((group) => group.provider.key === "google");
  const coursera = groups.find((group) => group.provider.key === "coursera");

  assert.equal(groups.length, 6);
  assert.equal(meta.certificates.length, 3);
  assert.equal(google.certificates.length, 2);
  assert.deepEqual(Array.from(coursera.certificates, (item) => item.title), ["Python for Everybody"]);
  assert.equal(Object.isFrozen(groups), true);
  assert.equal(Object.isFrozen(meta.certificates), true);
  assert.deepEqual(certificateData, before);
});

test("positions provider dialog below trigger and clamps viewport edges", () => {
  const below = api.getAnchoredDialogPosition(
    { left: 440, right: 520, top: 100, bottom: 164, width: 80, height: 64 },
    { width: 360, height: 250 },
    { width: 1000, height: 800 }
  );
  const leftEdge = api.getAnchoredDialogPosition(
    { left: 0, right: 80, top: 100, bottom: 164, width: 80, height: 64 },
    { width: 360, height: 250 },
    { width: 1000, height: 800 }
  );
  const rightEdge = api.getAnchoredDialogPosition(
    { left: 920, right: 1000, top: 100, bottom: 164, width: 80, height: 64 },
    { width: 360, height: 250 },
    { width: 1000, height: 800 }
  );
  const above = api.getAnchoredDialogPosition(
    { left: 440, right: 520, top: 700, bottom: 764, width: 80, height: 64 },
    { width: 360, height: 250 },
    { width: 1000, height: 800 }
  );

  assert.deepEqual({ left: below.left, top: below.top, placement: below.placement }, {
    left: 300,
    top: 176,
    placement: "below",
  });
  assert.equal(leftEdge.left, 16);
  assert.equal(rightEdge.left, 624);
  assert.equal(above.top, 438);
  assert.equal(above.placement, "above");
});

test("renders one static button per provider", () => {
  api.displayCertificates(certificateData);

  assert.equal(grid.children.length, 6);
  assert.equal(grid.querySelectorAll(".certificate-provider-button").length, 6);
  assert.equal(grid.querySelectorAll(".certificate-provider-icon").length, 6);
  assert.equal(grid.querySelectorAll("img")[0].getAttribute("src"), "assets/svg/certificates/meta.svg");
  assert.equal(grid.children[0].getAttribute("aria-label"), "View 3 Meta certificates");
  assert.equal(grid.children[0].getAttribute("aria-haspopup"), "dialog");
});

test("click opens Meta dialog with every related certificate", () => {
  api.displayCertificates(certificateData);
  const metaButton = grid.children[0];
  metaButton.rect = Object.freeze({ left: 440, right: 520, top: 100, bottom: 164, width: 80, height: 64 });
  dialog.rect = Object.freeze({ left: 0, right: 360, top: 0, bottom: 250, width: 360, height: 250 });
  metaButton.dispatch("click");

  assert.equal(dialog.open, true);
  assert.equal(dialog.querySelector(".certificate-dialog-title").textContent, "Meta");
  assert.equal(dialog.querySelectorAll(".certificate-detail-item").length, 3);
  assert.equal(dialog.querySelectorAll("a").length, 0);
  assert.equal(dialog.querySelectorAll("img").length, 1);
  assert.equal(document.activeElement, dialog.querySelector(".certificate-dialog-close"));
  assert.equal(dialog.style.left, "300px");
  assert.equal(dialog.style.top, "176px");
  assert.equal(dialog.getAttribute("data-placement"), "below");
  const [, timer] = getOnlyTimer();
  assert.equal(timer.delay, 10000);
  api.closeCertificateDialog();
});

test("open dialog repositions on viewport resize", () => {
  api.displayCertificates(certificateData);
  const metaButton = grid.children[0];
  metaButton.rect = Object.freeze({ left: 440, right: 520, top: 100, bottom: 164, width: 80, height: 64 });
  dialog.rect = Object.freeze({ left: 0, right: 360, top: 0, bottom: 250, width: 360, height: 250 });
  api.openCertificateDialog(0, metaButton);

  fakeWindow.innerWidth = 700;
  metaButton.rect = Object.freeze({ left: 600, right: 680, top: 100, bottom: 164, width: 80, height: 64 });
  fakeWindow.dispatch("resize");
  assert.equal(dialog.style.left, "324px");
  api.closeCertificateDialog();
  fakeWindow.innerWidth = 1000;
});

test("auto-close timer resets on valid open and closes after 10 seconds", () => {
  api.displayCertificates(certificateData);
  const metaButton = grid.children[0];
  const googleButton = grid.children[3];
  api.openCertificateDialog(0, metaButton);
  const [firstTimerId] = getOnlyTimer();

  api.openCertificateDialog(3, googleButton);
  const [secondTimerId, secondTimer] = getOnlyTimer();
  assert.notEqual(secondTimerId, firstTimerId);
  assert.equal(secondTimer.delay, 10000);
  assert.equal(api.openCertificateDialog(99, metaButton), false);
  assert.equal(getOnlyTimer()[0], secondTimerId);

  runTimer(secondTimerId);
  assert.equal(dialog.open, false);
  assert.equal(document.activeElement, googleButton);
  assert.equal(timers.size, 0);
});

test("renders malicious fields as text and omits unsafe verification links", () => {
  api.displayCertificates([
    certificate({
      certificate: '<img src=x onerror="alert(1)">',
      issurer: "<script>bad</script>",
      url: "javascript:alert(1)",
    }),
  ]);
  grid.children[0].dispatch("click");

  assert.equal(dialog.querySelector(".certificate-name").textContent, '<img src=x onerror="alert(1)">');
  assert.equal(dialog.querySelector(".certificate-item-issuer").textContent, "<script>bad</script>");
  assert.equal(dialog.querySelectorAll("a").length, 0);
  api.closeCertificateDialog();
});

test("renders British Council and Codelab brand art", () => {
  api.displayCertificates([
    certificate({ certificate: "IELTS", provider: "british-council" }),
    certificate({ certificate: "Codelab", provider: "codelab" }),
  ]);

  assert.equal(grid.querySelectorAll("img").length, 2);
  assert.equal(
    grid.querySelectorAll("img")[0].getAttribute("src"),
    "assets/svg/certificates/british-council.svg"
  );
  assert.equal(
    grid.querySelectorAll("img")[1].getAttribute("src"),
    "assets/images/certificates/codelab-logo.jpg"
  );
  assert.equal(grid.querySelectorAll("i").length, 0);
});

test("uses local provider marks with their official colors", async () => {
  const expectedColors = Object.freeze({
    "meta.svg": ["#0467DF"],
    "coursera.svg": ["#0056D2"],
    "mikrotik.svg": ["#C8C8C7"],
    "google.svg": ["#4285F4", "#34A853", "#FBBC05", "#EA4335"],
    "british-council.svg": ["#00A7DB"],
  });

  for (const [file, colors] of Object.entries(expectedColors)) {
    const svg = await readFile(new URL(`../assets/svg/certificates/${file}`, import.meta.url), "utf8");
    colors.forEach((color) => assert.match(svg, new RegExp(color, "i")));
    assert.doesNotMatch(svg, /#a3b5d3/i);
  }
});

test("opening a provider replaces dialog content", () => {
  api.displayCertificates(certificateData);
  assert.equal(api.openCertificateDialog(3, grid.children[3]), true);
  assert.equal(dialog.querySelector(".certificate-dialog-title").textContent, "Google");
  assert.equal(dialog.querySelectorAll(".certificate-detail-item").length, 2);
  assert.equal(api.openCertificateDialog(99, grid.children[0]), false);
  api.closeCertificateDialog();
});

test("close button, Escape, and backdrop close dialog and restore focus", () => {
  api.displayCertificates(certificateData);
  const trigger = grid.children[0];
  trigger.dispatch("click");
  dialog.querySelector(".certificate-dialog-close").dispatch("click");
  assert.equal(dialog.open, false);
  assert.equal(document.activeElement, trigger);
  assert.equal(timers.size, 0);

  trigger.dispatch("click");
  dialog.dispatch("cancel");
  assert.equal(dialog.open, false);
  assert.equal(timers.size, 0);

  trigger.dispatch("click");
  const panel = dialog.querySelector(".certificate-dialog-panel");
  dialog.dispatch("click", { target: panel });
  assert.equal(dialog.open, true);
  dialog.dispatch("click", { target: dialog });
  assert.equal(dialog.open, false);
  assert.equal(timers.size, 0);
});

test("empty data closes dialog and cancels auto-close", () => {
  api.displayCertificates(certificateData);
  grid.children[0].dispatch("click");
  assert.equal(timers.size, 1);

  api.displayCertificates([]);
  assert.equal(dialog.open, false);
  assert.equal(timers.size, 0);
});

test("ignores non-array certificate payloads", () => {
  api.displayCertificates({ certificate: "Invalid" });

  assert.equal(grid.children.length, 0);
});

test("returns safely when grid or dialog is unavailable", () => {
  grid.id = "";
  assert.doesNotThrow(() => api.displayCertificates([certificate()]));
  grid.id = "certificate-provider-grid";
  api.displayCertificates([certificate()]);
  dialog.id = "";
  assert.equal(api.openCertificateDialog(0, grid.children[0]), false);
  dialog.id = "certificate-dialog";
});

test("loads valid certificate data and reports invalid responses", async () => {
  context.fetch = async () => ({ ok: true, status: 200, json: async () => [certificate()] });
  await api.loadCertificatesData();
  assert.equal(grid.children.length, 1);

  context.fetch = async () => ({ ok: false, status: 503, json: async () => [] });
  await api.loadCertificatesData();
  assert.equal(loggedErrors.length, 1);

  context.fetch = async () => ({ ok: true, status: 200, json: async () => ({}) });
  await api.loadCertificatesData();
  assert.equal(loggedErrors.length, 2);
});

test("certificate styles use static grid and bounded modal", async () => {
  const css = await readFile(new URL("../css/certificates.css", import.meta.url), "utf8");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const script = await readFile(new URL("../js/certificates.js", import.meta.url), "utf8");

  assert.match(css, /\.certificate-provider-grid/);
  assert.match(css, /grid-template-columns: repeat\(auto-fit/);
  assert.match(css, /\.certificate-dialog::backdrop/);
  assert.match(css, /max-height: min\(80dvh, 720px\)/);
  assert.match(css, /position: fixed/);
  assert.match(css, /inset: auto/);
  assert.match(css, /margin: 0/);
  assert.match(css, /body:has\(\.certificate-dialog\[open\]\)/);
  assert.match(css, /overflow: hidden/);
  assert.match(css, /blur\(22px\) saturate\(135%\)/);
  assert.match(css, /rgba\(var\(--background-rgb\), 0\.42\)/);
  assert.match(css, /@keyframes certificate-dialog-enter/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css, /\.certificate-verify-link/);
  assert.doesNotMatch(css, /will-change: transform/);
  assert.match(html, /<dialog class="certificate-dialog" id="certificate-dialog"/);
  assert.doesNotMatch(html, /id="certificate-detail"/);
  assert.doesNotMatch(script, /requestAnimationFrame|startCertificateCarousel|createPauseController/);
});
