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
  const projectsGrid = document.getElementById("projects-grid");
  if (!projectsGrid) return;

  projectsGrid.replaceChildren();
  const descendingProjects = [...projects].reverse();
  descendingProjects.forEach((project, index) => {
    const projectCard = createProjectCard(project);
    projectsGrid.appendChild(projectCard);
    setTimeout(() => projectCard.classList.add("animate-in"), index * 200);
  });

  enhanceProjectImageLazyLoading();
}

function createProjectCard(project) {
  const projectCard = document.createElement("div");
  projectCard.className = "project-card";
  projectCard.append(createProjectImage(project), createProjectContent(project));
  return projectCard;
}

function createProjectImage(project) {
  const imageContainer = document.createElement("div");
  imageContainer.className = "project-image";

  if (project.image_placeholder) {
    const placeholder = document.createElement("div");
    const label = document.createElement("span");
    placeholder.className = "project-image-placeholder";
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", project.alt);
    label.textContent = "Image coming soon";
    placeholder.appendChild(label);
    imageContainer.appendChild(placeholder);
  } else {
    const image = document.createElement("img");
    image.src = project.photo_dir;
    image.alt = project.alt;
    image.loading = "lazy";
    imageContainer.appendChild(image);
  }

  imageContainer.appendChild(createProjectOverlay(project));
  return imageContainer;
}

function createProjectOverlay(project) {
  const overlay = document.createElement("div");
  const buttons = document.createElement("div");
  overlay.className = "project-image-overlay";
  buttons.className = "project-overlay-buttons";

  if (project.showcase.length > 0) {
    const viewButton = createOverlayButton("view", project.project_title);
    viewButton.addEventListener("click", (event) => {
      event.preventDefault();
      activeModalTrigger = viewButton;
      viewProject(project.project_title);
    });
    buttons.appendChild(viewButton);
  }

  if (project.live_url) {
    buttons.appendChild(createOverlayButton("live", project.project_title, project.live_url));
  }

  if (project.github_repo) {
    const codeButton = createOverlayButton("code", project.project_title);
    codeButton.addEventListener("click", (event) => {
      event.preventDefault();
      viewCode(project.project_title, project.github_repo);
    });
    buttons.appendChild(codeButton);
  }

  overlay.appendChild(buttons);
  return overlay;
}

function createOverlayButton(type, projectTitle, url = "") {
  const actions = {
    view: { className: "view-project-btn", icon: "fas fa-eye", label: "View" },
    live: { className: "live-project-btn", icon: "fas fa-external-link-alt", label: "Live" },
    code: { className: "view-code-btn", icon: "fas fa-code", label: "Code" },
  };
  const action = actions[type] || actions.view;
  const button = document.createElement("a");
  const icon = document.createElement("i");
  const label = document.createElement("span");
  button.href = type === "live" && isAllowedLiveUrl(url) ? url : "#";
  button.className = `project-overlay-btn ${action.className}`;
  button.dataset.project = projectTitle;
  icon.className = action.icon;
  icon.setAttribute("aria-hidden", "true");
  label.textContent = action.label;

  if (type === "live") {
    button.target = "_blank";
    button.rel = "noopener noreferrer";
    button.setAttribute("aria-label", `External link: ${projectTitle} (opens in a new tab)`);
  }

  button.append(icon, label);
  return button;
}

function createProjectContent(project) {
  const content = document.createElement("div");
  const title = document.createElement("h3");
  const description = document.createElement("p");
  const technologies = document.createElement("div");
  content.className = "project-content";
  title.className = "project-title";
  description.className = "project-description";
  technologies.className = "project-technologies";
  title.textContent = project.project_title;
  description.textContent = project.description;

  project.technologies.forEach((technology) => {
    const tag = document.createElement("span");
    tag.className = "technology-tag";
    tag.textContent = technology;
    technologies.appendChild(tag);
  });

  content.append(title, description, technologies);
  return content;
}

function viewProject(projectTitle) {
  const project = projectsData.find((item) => item.project_title === projectTitle);
  if (project && project.showcase.length > 0) {
    showProjectModal(project);
    return;
  }
  showNotification(`Showcase images coming soon for ${projectTitle}`, "var(--secondary-color)");
}

function viewCode(projectTitle, githubRepo) {
  if (!isAllowedGitHubUrl(githubRepo)) {
    showNotification(`GitHub repository coming soon for ${projectTitle}`, "var(--secondary-color)");
    return;
  }

  window.open(githubRepo, "_blank", "noopener,noreferrer");
  showNotification(`Opening ${projectTitle} repository...`, "var(--secondary-color)");
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
  const projectImages = document.querySelectorAll('.project-image img[loading="lazy"]');
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
