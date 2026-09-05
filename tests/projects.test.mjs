import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

class FakeClassList {
  constructor(element) {
    this.element = element;
  }

  values() {
    return new Set(this.element.className.split(/\s+/).filter(Boolean));
  }

  add(...names) {
    const values = this.values();
    names.forEach((name) => values.add(name));
    this.element.className = [...values].join(" ");
  }

  remove(...names) {
    const values = this.values();
    names.forEach((name) => values.delete(name));
    this.element.className = [...values].join(" ");
  }

  contains(name) {
    return this.values().has(name);
  }
}

function hasAncestorClass(element, className) {
  let current = element.parentNode;
  while (current) {
    if (current.classList.contains(className)) return true;
    current = current.parentNode;
  }
  return false;
}

function matchesSelector(element, selector) {
  if (selector === 'a[href]') return element.tagName === "A" && Boolean(element.href);
  if (selector === 'button:not([disabled])') return element.tagName === "BUTTON" && !element.disabled;
  if (selector === '[tabindex]:not([tabindex="-1"])') {
    return element.attributes.has("tabindex") && element.getAttribute("tabindex") !== "-1";
  }
  if (selector === '.project-media img[loading="lazy"]') {
    return element.tagName === "IMG" && element.loading === "lazy" && hasAncestorClass(element, "project-media");
  }
  if (selector === ".project-row[open]") return element.open && element.classList.contains("project-row");
  if (selector.startsWith("#")) return element.id === selector.slice(1);
  if (selector.startsWith(".")) return element.classList.contains(selector.slice(1));
  return element.tagName === selector.toUpperCase();
}

function descendants(root) {
  return root.children.flatMap((child) => [child, ...descendants(child)]);
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
    this.className = "";
    this.classList = new FakeClassList(this);
    this.style = {};
    this.dataset = {};
    this.textContent = "";
    this.hidden = false;
    this.open = false;
    this.offsetParent = {};
    this.parentNode = null;
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

  cloneNode() {
    const clone = new FakeElement(this.tagName, this.ownerDocument);
    clone.className = this.className;
    clone.textContent = this.textContent;
    return clone;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  toggleAttribute(name, force) {
    if (force) this.attributes.set(name, "");
    else this.attributes.delete(name);
    if (name === "hidden") this.hidden = Boolean(force);
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(type, [...listeners, listener]);
  }

  dispatch(type, event = {}) {
    const completeEvent = { target: this, preventDefault() {}, ...event };
    (this.listeners.get(type) || []).forEach((listener) => listener(completeEvent));
  }

  click() {
    this.dispatch("click");
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  querySelectorAll(selector) {
    const selectors = selector.split(",").map((part) => part.trim());
    return descendants(this).filter((element) => selectors.some((part) => matchesSelector(element, part)));
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }
}

class FakeDocument {
  constructor() {
    this.listeners = new Map();
    this.body = new FakeElement("body", this);
    this.body.style = {};
    this.activeElement = this.body;
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(type, [...listeners, listener]);
  }

  dispatch(type, event = {}) {
    (this.listeners.get(type) || []).forEach((listener) => listener(event));
  }

  getElementById(id) {
    return [this.body, ...descendants(this.body)].find((element) => element.id === id) || null;
  }

  querySelectorAll(selector) {
    return this.body.querySelectorAll(selector);
  }

  querySelector(selector) {
    return this.body.querySelector(selector);
  }
}

class FakeIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.observed = [];
  }

  observe(element) {
    this.observed.push(element);
    this.callback([
      { isIntersecting: false, target: element },
      { isIntersecting: true, target: element },
    ]);
  }

  unobserve(element) {
    this.observed = this.observed.filter((item) => item !== element);
  }
}

function addFixture(document, tagName, id, className = "") {
  const element = document.createElement(tagName);
  element.id = id;
  element.className = className;
  document.body.appendChild(element);
  return element;
}

function createDocumentFixture() {
  const document = new FakeDocument();
  addFixture(document, "div", "featured-projects");
  addFixture(document, "div", "project-ledger");
  addFixture(document, "p", "projects-count");
  addFixture(document, "p", "projects-empty");
  addFixture(document, "div", "", "project-ledger-heading");
  const modal = addFixture(document, "div", "project-modal", "project-modal");
  modal.setAttribute("aria-hidden", "true");
  modal.appendChild(Object.assign(document.createElement("div"), { className: "modal-overlay" }));
  modal.appendChild(Object.assign(document.createElement("h3"), { id: "modal-title" }));
  modal.appendChild(Object.assign(document.createElement("div"), { id: "project-showcase" }));
  modal.appendChild(Object.assign(document.createElement("button"), { id: "modal-close" }));
  return document;
}

function projectFixture(overrides = {}) {
  return {
    project_title: "API project",
    description: "Reliable service with audited data flows.",
    alt: "API project dashboard",
    photo_dir: "project_images/cover.png",
    github_repo: "https://github.com/minkonaing99/api-project",
    live_url: "",
    image_placeholder: false,
    showcase: ["valid.png"],
    technologies: ["Node.js", "Express.js", "MongoDB"],
    ...overrides,
  };
}

const document = createDocumentFixture();
const source = await readFile(new URL("../js/projects.js", import.meta.url), "utf8");
const context = vm.createContext({
  URL,
  document,
  IntersectionObserver: FakeIntersectionObserver,
  console: { error() {} },
  window: {
    IntersectionObserver: FakeIntersectionObserver,
    matchMedia: () => ({ matches: false }),
  },
});

vm.runInContext(`${source}
globalThis.projectTestApi = {
  cleanText, isAllowedGitHubUrl, isAllowedLiveUrl, normalizeProject,
  loadProjectsData, displayProjects, createProjectMedia, createProjectActions,
  createAction, showProjectModal, showImageError, closeProjectModal,
  trapModalFocus, enhanceProjectImageLazyLoading, revealProjectCatalog,
};`, context, { filename: new URL("../js/projects.js", import.meta.url).pathname });

const api = context.projectTestApi;

test("normalization validates text, images, and proof URLs without mutation", () => {
  const technologies = [" Node.js ", 42, "Express.js"];
  const showcase = ["valid.png", "../escape.png", "notes.txt"];
  const normalized = api.normalizeProject({
    ...projectFixture(), technologies, showcase,
  });

  assert.equal(api.cleanText("  Project title  "), "Project title");
  assert.equal(api.cleanText({ toString: () => "unsafe" }), "");
  assert.equal(api.isAllowedGitHubUrl("https://github.com/minkonaing99/repo"), true);
  assert.equal(api.isAllowedGitHubUrl("https://github.com/other/repo"), false);
  assert.equal(api.isAllowedGitHubUrl("invalid"), false);
  assert.equal(api.isAllowedGitHubUrl(null), false);
  assert.equal(api.isAllowedLiveUrl("https://store.merxylab.com/"), true);
  assert.equal(api.isAllowedLiveUrl("https://store.merxylab.com/admin"), false);
  assert.equal(api.isAllowedLiveUrl(null), false);
  assert.deepEqual([...normalized.technologies], ["Node.js", "Express.js"]);
  assert.deepEqual([...normalized.showcase], ["valid.png"]);
  assert.deepEqual(technologies, [" Node.js ", 42, "Express.js"]);
  assert.deepEqual(showcase, ["valid.png", "../escape.png", "notes.txt"]);
  assert.equal(api.normalizeProject(null).image_placeholder, true);
});

test("catalog renders four featured cases and a ten-row ledger", () => {
  const projects = Array.from({ length: 14 }, (_, index) => projectFixture({
    project_title: `Project ${index + 1}`,
    live_url: index === 13 ? "https://store.merxylab.com/" : "",
    image_placeholder: index === 0,
  }));
  const originalOrder = projects.map((project) => project.project_title);

  api.displayProjects(projects);

  assert.equal(document.getElementById("featured-projects").children.length, 4);
  assert.equal(document.getElementById("project-ledger").children.length, 10);
  assert.equal(document.getElementById("projects-count").textContent, "14 projects");
  assert.equal(document.getElementById("projects-empty").hidden, true);
  assert.deepEqual(projects.map((project) => project.project_title), originalOrder);
  assert.equal(document.querySelectorAll(".catalog-reveal").every((item) => item.classList.contains("is-visible")), true);
  assert.equal(document.querySelectorAll('.project-media img[loading="lazy"]').every((image) => image.classList.contains("loaded")), true);
});

test("catalog exposes persistent gallery, live, and source actions", () => {
  const actions = api.createProjectActions(projectFixture({ live_url: "https://store.merxylab.com/" }));
  assert.equal(actions.children.length, 3);
  assert.equal(actions.children[1].target, "_blank");
  assert.equal(actions.children[1].rel, "noopener noreferrer");

  actions.children[0].click();
  const modal = document.getElementById("project-modal");
  assert.equal(modal.classList.contains("active"), true);
  assert.equal(modal.getAttribute("aria-hidden"), "false");
  assert.equal(document.activeElement.id, "modal-close");

  api.closeProjectModal();
  assert.equal(modal.classList.contains("active"), false);
  assert.equal(document.activeElement, actions.children[0]);
});

test("modal errors, focus trapping, and keyboard listeners remain functional", () => {
  const imageContainer = document.createElement("div");
  api.showImageError(imageContainer, "missing.png");
  assert.match(imageContainer.children[0].textContent, /missing\.png/);

  const modal = document.getElementById("project-modal");
  const close = document.getElementById("modal-close");
  document.dispatch("DOMContentLoaded");
  close.focus();
  let prevented = false;
  api.trapModalFocus({ key: "Tab", shiftKey: false, preventDefault() { prevented = true; } }, modal);
  assert.equal(prevented, true);
  api.trapModalFocus({ key: "Tab", shiftKey: true, preventDefault() { prevented = true; } }, modal);
  api.trapModalFocus({ key: "Escape", preventDefault() {} }, modal);
  api.trapModalFocus({ key: "Tab", preventDefault() {} }, document.createElement("div"));

  api.showProjectModal(projectFixture());
  modal.querySelector(".modal-overlay").dispatch("click");
  api.showProjectModal(projectFixture());
  document.dispatch("keydown", { key: "Escape" });
  assert.equal(modal.getAttribute("aria-hidden"), "true");
  document.dispatch("keydown", { key: "Escape" });
});

test("empty and failed data loads produce a stable empty state", async () => {
  api.displayProjects([]);
  assert.equal(document.getElementById("projects-empty").hidden, false);
  assert.equal(document.getElementById("projects-count").textContent, "0 projects");

  context.fetch = async () => ({ ok: true, json: async () => [projectFixture()] });
  await api.loadProjectsData();
  assert.equal(document.getElementById("projects-count").textContent, "1 projects");

  context.fetch = async () => ({ ok: false, status: 500 });
  await api.loadProjectsData();
  assert.equal(document.getElementById("projects-empty").hidden, false);
});

test("project media and controls cover placeholder and no-proof states", () => {
  const placeholder = api.createProjectMedia(projectFixture({ image_placeholder: true }));
  assert.equal(placeholder.children[0].className, "project-media-placeholder");
  assert.equal(api.createProjectActions(projectFixture({ showcase: [], github_repo: "" })).children.length, 0);
  assert.equal(api.createAction("button", "Inspect", "fas fa-eye").type, "button");

  delete context.window.IntersectionObserver;
  api.enhanceProjectImageLazyLoading();
  context.window.IntersectionObserver = FakeIntersectionObserver;
  context.window.matchMedia = () => ({ matches: true });
  api.revealProjectCatalog();
  context.window.matchMedia = () => ({ matches: false });
});

test("catalog markup and styles preserve the recruiter-first structure", async () => {
  const [html, catalogCss, ledgerCss] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../css/projects.css", import.meta.url), "utf8"),
    readFile(new URL("../css/project-ledger.css", import.meta.url), "utf8"),
  ]);

  assert.match(html, /id="featured-projects"/);
  assert.match(html, /id="project-ledger"/);
  assert.match(catalogCss, /\.project-case-lead/);
  assert.match(ledgerCss, /\.project-row\[open\] \.project-row-panel/);
});
