let projectsData = [];

async function loadProjectsData() {
  try {
    const response = await fetch("data/projects.json");
    projectsData = await response.json();
    displayProjects(projectsData);
  } catch (error) {
    console.error("Error loading projects data:", error);
  }
}

function displayProjects(projectsData) {
  const projectsGrid = document.getElementById("projects-grid");
  if (!projectsGrid) return;

  projectsGrid.innerHTML = "";

  projectsData.forEach((project, index) => {
    const projectCard = document.createElement("article");
    projectCard.className = "project-card";

    const hasShowcase = project.showcase && project.showcase.length > 0;
    const hasRepo =
      project.github_repo && project.github_repo !== "https://github.com/yourusername/";
    const techLine = project.technologies ? project.technologies.join(" · ") : "";
    const indexLabel = String(index + 1).padStart(2, "0");

    const imageTag = hasShowcase
      ? `<button class="project-image view-project-btn" data-project="${project.project_title}"
          aria-label="View ${project.project_title} screenshots">
          <img src="${project.photo_dir}" alt="${project.alt}" loading="lazy">
        </button>`
      : `<div class="project-image" data-static>
          <img src="${project.photo_dir}" alt="${project.alt}" loading="lazy">
        </div>`;

    projectCard.innerHTML = `
      ${imageTag}
      <div class="project-content">
        <div class="project-head">
          <span class="project-index">${indexLabel}</span>
          <h3 class="project-title">${project.project_title}</h3>
        </div>
        <p class="project-description">${project.description}</p>
        <p class="project-tech">${techLine}</p>
        <div class="project-links">
          ${hasShowcase
            ? `<button class="project-link view-project-btn" data-project="${project.project_title}">Screenshots</button>`
            : ""}
          ${hasRepo
            ? `<a class="project-link" href="${project.github_repo}" target="_blank" rel="noopener noreferrer">Source ↗</a>`
            : ""}
        </div>
      </div>
    `;

    projectsGrid.appendChild(projectCard);

    projectCard.querySelectorAll(".view-project-btn").forEach((btn) => {
      btn.addEventListener("click", () => viewProject(btn.dataset.project));
    });

    if (window.revealOnScroll) window.revealOnScroll(projectCard);
  });

  enhanceProjectImageLazyLoading();
}

function viewProject(projectTitle) {
  const project = projectsData.find((p) => p.project_title === projectTitle);

  if (project && project.showcase && project.showcase.length > 0) {
    showProjectModal(project);
  } else {
    showNotification(`Showcase images coming soon for ${projectTitle}`);
  }
}

function showProjectModal(project) {
  const modal = document.getElementById("project-modal");
  const modalTitle = document.getElementById("modal-title");
  const projectShowcase = document.getElementById("project-showcase");

  modalTitle.textContent = project.project_title;
  projectShowcase.innerHTML = "";

  const showcaseContainer = document.createElement("div");
  showcaseContainer.className = "showcase-container";

  const imagesWrapper = document.createElement("div");
  imagesWrapper.className = "showcase-images-wrapper";

  project.showcase.forEach((imageName, index) => {
    const showcaseDiv = document.createElement("div");
    showcaseDiv.className = "showcase-image loading";
    showcaseDiv.dataset.index = index;

    const img = document.createElement("img");
    img.alt = `${project.project_title} showcase ${index + 1}`;

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            target.src = `project_images/${imageName}`;
            target.classList.remove("loading");
            target.parentElement.classList.remove("loading");
            imageObserver.unobserve(target);
          }
        });
      },
      { rootMargin: "50px 0px", threshold: 0.1 }
    );

    img.onerror = function () {
      this.style.display = "none";
      showcaseDiv.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;min-height:300px;
          color:var(--ink-3);font-family:var(--font-mono);font-size:0.75rem;">
          Image not available: ${imageName}
        </div>`;
      showcaseDiv.classList.remove("loading");
    };

    img.onload = function () {
      showcaseDiv.classList.remove("loading");
    };

    showcaseDiv.appendChild(img);
    imagesWrapper.appendChild(showcaseDiv);
    imageObserver.observe(img);
  });

  showcaseContainer.appendChild(imagesWrapper);
  projectShowcase.appendChild(showcaseContainer);

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeProjectModal() {
  const modal = document.getElementById("project-modal");
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("project-modal");
  const modalClose = document.getElementById("modal-close");
  const modalOverlay = modal.querySelector(".modal-overlay");

  modalClose.addEventListener("click", closeProjectModal);
  modalOverlay.addEventListener("click", closeProjectModal);

  document.addEventListener("keydown", function (e) {
    if (modal.classList.contains("active") && e.key === "Escape") {
      closeProjectModal();
    }
  });
});

function enhanceProjectImageLazyLoading() {
  const projectImages = document.querySelectorAll('.project-image img[loading="lazy"]');

  const projectImageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("loaded");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "100px 0px", threshold: 0.1 }
  );

  projectImages.forEach((img) => projectImageObserver.observe(img));
}
