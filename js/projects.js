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
    const projectCard = document.createElement("div");
    projectCard.className = "project-card";

    const technologiesList = project.technologies
      ? project.technologies.map((tech) => `<span class="technology-tag">${tech}</span>`).join("")
      : "";

    projectCard.innerHTML = `
      <div class="project-image">
        <img src="${project.photo_dir}" alt="${project.alt}" loading="lazy">
        <div class="project-image-overlay">
          <div class="project-overlay-buttons">
            ${project.showcase && project.showcase.length > 0
              ? `<a href="#" class="project-overlay-btn view-project-btn" data-project="${project.project_title}">
                  <i class="fas fa-eye"></i><span>View</span>
                </a>`
              : ""}
            ${project.github_repo && project.github_repo !== "https://github.com/yourusername/"
              ? `<a href="#" class="project-overlay-btn view-code-btn" data-project="${project.project_title}" data-repo="${project.github_repo}">
                  <i class="fas fa-code"></i><span>Code</span>
                </a>`
              : ""}
          </div>
        </div>
      </div>
      <div class="project-content">
        <h3 class="project-title">${project.project_title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-technologies">${technologiesList}</div>
      </div>
    `;

    projectsGrid.appendChild(projectCard);

    const viewBtn = projectCard.querySelector(".view-project-btn");
    const codeBtn = projectCard.querySelector(".view-code-btn");

    if (viewBtn) {
      viewBtn.addEventListener("click", (e) => {
        e.preventDefault();
        viewProject(viewBtn.dataset.project);
      });
    }

    if (codeBtn) {
      codeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        viewCode(codeBtn.dataset.project, codeBtn.dataset.repo);
      });
    }

    setTimeout(() => {
      projectCard.classList.add("animate-in");
    }, index * 200);
  });

  enhanceProjectImageLazyLoading();
}

function viewProject(projectTitle) {
  const project = projectsData.find((p) => p.project_title === projectTitle);

  if (project && project.showcase && project.showcase.length > 0) {
    showProjectModal(project);
  } else {
    showNotification(`Showcase images coming soon for ${projectTitle}`, "#f39c12");
  }
}

function viewCode(projectTitle, githubRepo) {
  if (githubRepo && githubRepo !== "https://github.com/yourusername/") {
    window.open(githubRepo, "_blank");
    showNotification(`Opening ${projectTitle} repository...`, "var(--secondary-color)");
  } else {
    showNotification(`GitHub repository coming soon for ${projectTitle}`, "#f39c12");
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
          background:rgba(255,255,255,0.05);border-radius:15px;
          color:rgba(255,255,255,0.6);font-style:italic;">
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
