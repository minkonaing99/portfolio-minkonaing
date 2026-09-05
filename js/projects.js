let projectsData = [];
let activeModalTrigger = null;

const PROJECT_IMAGE_PATTERN = /^project_images\/[a-zA-Z0-9._() -]+\.(png|jpe?g|webp|gif)$/i;
const SHOWCASE_IMAGE_PATTERN = /^[a-zA-Z0-9._() -]+\.(png|jpe?g|webp|gif)$/i;

async function loadProjectsData() {
  try {
    const response = await fetch("data/projects.json");
    if (!response.ok) throw new Error(`Projects request failed: ${response.status}`);

    const parsedProjects = await response.json();
    if (!Array.isArray(parsedProjects)) throw new TypeError("Projects data must be an array");

    projectsData = parsedProjects
      .map(normalizeProject)
      .filter((project) => project.project_title && project.description);
    displayProjects(projectsData);
  } catch (error) {
    console.error("Error loading projects data:", error);
    displayProjects([]);
  }
}

function cleanText(value, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isAllowedGitHubUrl(value) {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    const pathParts = url.pathname.split("/").filter(Boolean);
    return url.protocol === "https:"
      && url.hostname === "github.com"
      && !url.port
      && !url.username
      && !url.password
      && !url.search
      && !url.hash
      && pathParts.length === 2
      && pathParts[0].toLowerCase() === "minkonaing99";
  } catch {
    return false;
  }
}

function isAllowedLiveUrl(value) {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && url.hostname === "store.merxylab.com"
      && url.pathname === "/"
      && !url.port
      && !url.username
      && !url.password
      && !url.search
      && !url.hash;
  } catch {
    return false;
  }
}

function normalizeProject(project) {
  const source = project && typeof project === "object" ? project : {};
  const photoDir = PROJECT_IMAGE_PATTERN.test(source.photo_dir || "") ? source.photo_dir : "";
  const technologies = Array.isArray(source.technologies)
    ? source.technologies.map((tech) => cleanText(tech, 50)).filter(Boolean).slice(0, 20)
    : [];
  const showcase = Array.isArray(source.showcase)
    ? source.showcase.filter((image) => SHOWCASE_IMAGE_PATTERN.test(image)).slice(0, 30)
    : [];

  return {
    project_title: cleanText(source.project_title, 100),
    description: cleanText(source.description, 700),
    alt: cleanText(source.alt, 160) || "Project preview",
    photo_dir: photoDir,
    github_repo: isAllowedGitHubUrl(source.github_repo) ? source.github_repo : "",
    live_url: isAllowedLiveUrl(source.live_url) ? source.live_url : "",
    image_placeholder: source.image_placeholder === true || !photoDir,
    showcase,
    technologies,
  };
}

function displayProjects(projects) {
  const featured = document.getElementById("featured-projects");
  const ledger = document.getElementById("project-ledger");
  const count = document.getElementById("projects-count");
  const empty = document.getElementById("projects-empty");
  if (!featured || !ledger || !count || !empty) return;

  const orderedProjects = [...projects].reverse();
  featured.replaceChildren(...orderedProjects.slice(0, 4).map(createFeaturedCase));
  ledger.replaceChildren(...orderedProjects.slice(4).map(createProjectRow));
  count.textContent = `${orderedProjects.length} projects`;
  empty.hidden = orderedProjects.length > 0;
  document.querySelector(".project-ledger-heading")?.toggleAttribute("hidden", orderedProjects.length <= 4);
  enhanceProjectImageLazyLoading();
  revealProjectCatalog();
}

function createFeaturedCase(project, index) {
  const article = document.createElement("article");
  const content = document.createElement("div");
  const label = document.createElement("p");
  const title = document.createElement("h3");
  const description = document.createElement("p");
  const layouts = ["lead", "wide", "compact", "band"];

  article.className = `project-case project-case-${layouts[index] || "wide"} catalog-reveal`;
  content.className = "project-case-content";
  label.className = "project-case-label";
  title.className = "project-case-title";
  description.className = "project-case-description";
  label.textContent = index === 0 ? "Featured build" : `Selected work 0${index + 1}`;
  title.textContent = project.project_title;
  description.textContent = project.description;
  content.append(label, title, description, createTechSummary(project.technologies), createProjectActions(project));
  article.append(createProjectMedia(project), content);
  return article;
}

function createProjectRow(project, index) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const identity = document.createElement("span");
  const number = document.createElement("span");
  const title = document.createElement("span");
  const description = document.createElement("span");
  const proof = createProofList(project);
  const toggle = document.createElement("span");
  const panel = document.createElement("div");
  const panelInner = document.createElement("div");
  const copy = document.createElement("div");

  details.className = "project-row catalog-reveal";
  summary.className = "project-row-summary";
  identity.className = "project-row-identity";
  number.className = "project-row-number";
  title.className = "project-row-title";
  description.className = "project-row-description";
  toggle.className = "project-row-toggle";
  panel.className = "project-row-panel";
  panelInner.className = "project-row-panel-inner";
  copy.className = "project-row-copy";
  number.textContent = String(index + 5).padStart(2, "0");
  title.textContent = project.project_title;
  description.textContent = project.description;
  toggle.setAttribute("aria-hidden", "true");
  identity.append(number, title);
  summary.append(identity, description, createTechSummary(project.technologies.slice(0, 3), "span"), proof, toggle);
  copy.append(description.cloneNode(true), createTechSummary(project.technologies), createProjectActions(project));
  panelInner.append(createProjectMedia(project), copy);
  panel.appendChild(panelInner);
  details.append(summary, panel);
  return details;
}

function createProjectMedia(project) {
  const media = document.createElement("div");
  media.className = "project-media";

  if (project.image_placeholder) {
    const placeholder = document.createElement("div");
    const label = document.createElement("span");
    placeholder.className = "project-media-placeholder";
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", project.alt);
    label.textContent = "Preview in progress";
    placeholder.appendChild(label);
    media.appendChild(placeholder);
  } else {
    const image = document.createElement("img");
    image.src = project.photo_dir;
    image.alt = project.alt;
    image.loading = "lazy";
    media.appendChild(image);
  }

  return media;
}

function createProjectActions(project) {
  const actions = document.createElement("div");
  actions.className = "project-actions";

  if (project.showcase.length > 0) {
    const gallery = createAction("button", "View gallery", "fas fa-images");
    gallery.addEventListener("click", () => {
      activeModalTrigger = gallery;
      showProjectModal(project);
    });
    actions.appendChild(gallery);
  }

  if (project.live_url) {
    actions.appendChild(createAction("link", "Open live site", "fas fa-arrow-up-right-from-square", project.live_url));
  }

  if (project.github_repo) {
    actions.appendChild(createAction("link", "View source", "fab fa-github", project.github_repo));
  }

  return actions;
}

function createAction(type, labelText, iconClass, url = "") {
  const control = document.createElement(type === "button" ? "button" : "a");
  const icon = document.createElement("i");
  const label = document.createElement("span");
  control.className = "project-action";
  icon.className = iconClass;
  icon.setAttribute("aria-hidden", "true");
  label.textContent = labelText;

  if (type === "button") {
    control.type = "button";
  } else {
    control.href = url;
    control.target = "_blank";
    control.rel = "noopener noreferrer";
    control.setAttribute("aria-label", `${labelText} (opens in a new tab)`);
  }

  control.append(icon, label);
  return control;
}

function createTechSummary(technologies, element = "p") {
  const summary = document.createElement(element);
  summary.className = "project-tech";
  summary.textContent = technologies.join(" / ") || "Technical details available on request";
  return summary;
}

function createProofList(project) {
  const proof = document.createElement("span");
  const labels = [];
  if (project.showcase.length > 0) labels.push("Gallery");
  if (project.live_url) labels.push("Live");
  if (project.github_repo) labels.push("Source");
  proof.className = "project-row-proof";
  proof.textContent = labels.join(" + ") || "Overview";
  return proof;
}

function showProjectModal(project) {
  const modal = document.getElementById("project-modal");
  const modalTitle = document.getElementById("modal-title");
  const projectShowcase = document.getElementById("project-showcase");
  if (!modal || !modalTitle || !projectShowcase) return;

  modalTitle.textContent = project.project_title;
  projectShowcase.replaceChildren();
  const showcaseContainer = document.createElement("div");
  const imagesWrapper = document.createElement("div");
  showcaseContainer.className = "showcase-container";
  imagesWrapper.className = "showcase-images-wrapper";

  project.showcase.forEach((imageName, index) => {
    imagesWrapper.appendChild(createShowcaseImage(project, imageName, index));
  });

  showcaseContainer.appendChild(imagesWrapper);
  projectShowcase.appendChild(showcaseContainer);
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("modal-close")?.focus();
}

function createShowcaseImage(project, imageName, index) {
  const showcase = document.createElement("div");
  const image = document.createElement("img");
  showcase.className = "showcase-image loading";
  showcase.dataset.index = index;
  image.alt = `${project.project_title} showcase ${index + 1}`;

  image.onerror = () => showImageError(showcase, imageName);
  image.onload = () => showcase.classList.remove("loading");
  showcase.appendChild(image);

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    image.src = `project_images/${imageName}`;
    observer.unobserve(image);
  }, { rootMargin: "50px 0px", threshold: 0.1 });
  observer.observe(image);
  return showcase;
}

function showImageError(container, imageName) {
  const message = document.createElement("div");
  message.style.cssText = "display:flex;align-items:center;justify-content:center;min-height:300px;background:rgba(var(--text-rgb),0.05);border-radius:15px;color:rgba(var(--text-rgb),0.65);font-style:italic";
  message.textContent = `Image not available: ${imageName}`;
  container.replaceChildren(message);
  container.classList.remove("loading");
}

function closeProjectModal() {
  const modal = document.getElementById("project-modal");
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  activeModalTrigger?.focus();
  activeModalTrigger = null;
}

function trapModalFocus(event, modal) {
  if (event.key !== "Tab") return;
  const selector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusable = [...modal.querySelectorAll(selector)].filter((element) => element.offsetParent !== null);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("project-modal");
  const modalClose = document.getElementById("modal-close");
  const modalOverlay = modal?.querySelector(".modal-overlay");
  if (!modal || !modalClose || !modalOverlay) return;

  modalClose.addEventListener("click", closeProjectModal);
  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) closeProjectModal();
  });
  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("active")) return;
    if (event.key === "Escape") closeProjectModal();
    trapModalFocus(event, modal);
  });
});

function enhanceProjectImageLazyLoading() {
  const projectImages = document.querySelectorAll('.project-media img[loading="lazy"]');
  if (!("IntersectionObserver" in window)) {
    projectImages.forEach((image) => image.classList.add("loaded"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("loaded");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "100px 0px", threshold: 0.1 });
  projectImages.forEach((image) => observer.observe(image));
}

function revealProjectCatalog() {
  const items = [...document.querySelectorAll(".catalog-reveal")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "80px 0px", threshold: 0.08 });
  items.forEach((item) => observer.observe(item));
}
