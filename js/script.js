// DOM Elements
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navbar = document.querySelector(".navbar");
const navLinks = document.querySelectorAll(".nav-link");

// Mobile Menu Toggle
navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  navToggle.classList.toggle("active");
});

// Close mobile menu when clicking on a link
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    navToggle.classList.remove("active");
  });
});

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
    navMenu.classList.remove("active");
    navToggle.classList.remove("active");
  }
});

// Optimized Scroll Effects with Throttling
let ticking = false;

// Throttled scroll handler for better performance
function updateOnScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateNavbar();
      updateActiveLinks();
      ticking = false;
    });
    ticking = true;
  }
}

// Scroll Effect for Navbar
function updateNavbar() {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

// Smooth scrolling for navigation links
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href");
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      // Use scrollIntoView for better smooth scrolling
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Active link highlighting based on scroll position
function updateActiveLinks() {
  let current = "";
  const sections = document.querySelectorAll("section[id]");

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.clientHeight;

    if (
      window.scrollY >= sectionTop &&
      window.scrollY < sectionTop + sectionHeight
    ) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
}

// Single optimized scroll event listener
window.addEventListener("scroll", updateOnScroll, { passive: true });

// Add loading animation
document.addEventListener("DOMContentLoaded", () => {
  // Add a small delay to show the loading animation
  setTimeout(() => {
    document.body.classList.add("loaded");
  }, 100);

  // Initialize countdown timer
  updateExperienceCountdown();

  // Initialize projects counter animation
  animateProjectsCounter();

  // Update countdown every day
  setInterval(updateExperienceCountdown, 24 * 60 * 60 * 1000);
});

// Experience countdown function with animation
function updateExperienceCountdown() {
  const startDate = new Date("2024-06-01");
  const currentDate = new Date();

  // Calculate the difference
  const timeDiff = currentDate - startDate;

  // Convert to years, months, and days
  const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));
  const months = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44)
  );
  const days = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24)
  );

  // Animate the experience display
  animateExperienceDisplay(years, months, days, timeDiff);
}

// Animate experience display progressively
function animateExperienceDisplay(years, months, days, timeDiff) {
  const countdownElement = document.getElementById("experience-countdown");
  if (!countdownElement) return;

  // If less than a day, show "Just Started" immediately
  if (timeDiff < 1000 * 60 * 60 * 24) {
    countdownElement.textContent = "Just Started";
    return;
  }

  // Calculate total days from start date
  const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  let currentDay = 0;

  const animate = () => {
    if (currentDay <= totalDays) {
      // Calculate what to display based on current day
      let displayText = "";

      if (currentDay === 0) {
        displayText = "0 Days";
      } else if (currentDay < 365) {
        displayText = `${currentDay} ${currentDay === 1 ? "Day" : "Days"}`;
      } else {
        const years = Math.floor(currentDay / 365);
        const remainingDays = currentDay % 365;

        if (remainingDays === 0) {
          displayText = `${years} ${years === 1 ? "Year" : "Years"}`;
        } else {
          displayText = `${years} ${
            years === 1 ? "Year" : "Years"
          } & ${remainingDays}\u00A0${remainingDays === 1 ? "Day" : "Days"}`;
        }
      }

      countdownElement.textContent = displayText;
      currentDay++;

      // Calculate dynamic speed to finish in ~0.8 seconds
      const totalDuration = 300; // 0.8 seconds total
      const remainingSteps = totalDays - currentDay;
      const timePerStep =
        remainingSteps > 0 ? totalDuration / remainingSteps : 0;
      const dynamicSpeed = Math.max(1, Math.min(20, timePerStep)); // Between 1ms and 20ms

      setTimeout(animate, dynamicSpeed);
    }
  };

  // Start the animation sequence
  setTimeout(animate, 500);
}

// Animate projects counter
function animateProjectsCounter() {
  const projectsElement = document.querySelector(".stat-group.projects h3");
  if (!projectsElement) return;

  const targetNumber = 20; // The final number to count to
  let currentNumber = 0;
  const increment = Math.ceil(targetNumber / 50); // Divide animation into 50 steps
  const duration = 2000; // 2 seconds total
  const stepDuration = duration / 50;

  const animate = () => {
    if (currentNumber < targetNumber) {
      currentNumber = Math.min(currentNumber + increment, targetNumber);
      projectsElement.textContent = `More than ${currentNumber}`;
      setTimeout(animate, stepDuration);
    }
  };

  // Start animation after a delay
  setTimeout(animate, 1000);
}

// Button click effect
const ctaButton = document.querySelector(".cta-button");
if (ctaButton) {
  ctaButton.addEventListener("click", (e) => {
    // Create ripple effect
    const ripple = document.createElement("span");
    const rect = ctaButton.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.classList.add("ripple");

    ctaButton.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
}

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animate-in");
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const animateElements = document.querySelectorAll(".nav-link, .cta-button");
  animateElements.forEach((el) => observer.observe(el));
});

// Keyboard navigation support
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    navMenu.classList.remove("active");
    navToggle.classList.remove("active");
  }
});

// Touch gesture support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0 && navMenu.classList.contains("active")) {
      // Swipe left - close menu
      navMenu.classList.remove("active");
      navToggle.classList.remove("active");
    } else if (diff < 0 && !navMenu.classList.contains("active")) {
      // Swipe right - open menu
      navMenu.classList.add("active");
      navToggle.classList.add("active");
    }
  }
}

// Load and display experience data
async function loadExperienceData() {
  try {
    const response = await fetch("data/experience.json");
    const experienceData = await response.json();
    displayExperience(experienceData);
  } catch (error) {
    console.error("Error loading experience data:", error);
  }
}

function displayExperience(experienceData) {
  const timeline = document.getElementById("experience-timeline");
  if (!timeline) return;

  timeline.innerHTML = "";

  experienceData.forEach((experience, index) => {
    const experienceItem = document.createElement("div");
    experienceItem.className = "experience-item";

    // Create responsibilities list for tooltip
    const responsibilitiesList = experience.responsibilities
      ? experience.responsibilities.map((resp) => `<li>${resp}</li>`).join("")
      : "";

    experienceItem.innerHTML = `
      <div class="experience-content">
        <h3 class="experience-position">${experience.position}</h3>
        <p class="experience-company">${experience.company}</p>
        <p class="experience-duration">${experience.duration}</p>
      </div>
      <div class="experience-tooltip">
        <div class="tooltip-content">
          <h4>Responsibilities:</h4>
          <ul>
            ${responsibilitiesList}
          </ul>
        </div>
      </div>
    `;

    timeline.appendChild(experienceItem);

    // Add click event for tooltip
    const experienceContent = experienceItem.querySelector(
      ".experience-content"
    );
    const tooltip = experienceItem.querySelector(".experience-tooltip");

    experienceContent.addEventListener("click", function () {
      // Close all other tooltips first
      document.querySelectorAll(".experience-tooltip").forEach((t) => {
        if (t !== tooltip) {
          t.classList.remove("active");
        }
      });

      // Toggle current tooltip
      tooltip.classList.toggle("active");
    });

    // Close tooltip when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !experienceContent.contains(e.target) &&
        !tooltip.contains(e.target)
      ) {
        tooltip.classList.remove("active");
      }
    });

    // Animate items with delay
    setTimeout(() => {
      experienceItem.classList.add("animate-in");
    }, index * 200);
  });
}

// Load and display projects data
async function loadProjectsData() {
  try {
    const response = await fetch("data/projects.json");
    projectsData = await response.json(); // Store in global variable
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

    // Create technologies list
    const technologiesList = project.technologies
      ? project.technologies
          .map((tech) => `<span class="technology-tag">${tech}</span>`)
          .join("")
      : "";

    // Create showcase images if available
    const showcaseImages = project.showcase
      ? project.showcase
          .map(
            (img) =>
              `<img src="assets/images/${img}" alt="${project.project_title} showcase" loading="lazy">`
          )
          .join("")
      : "";

    projectCard.innerHTML = `
      <div class="project-image">
        <img src="${project.photo_dir}" alt="${project.alt}" loading="lazy">
                 <div class="project-image-overlay">
                       <div class="project-overlay-buttons">
              ${
                project.showcase && project.showcase.length > 0
                  ? `
                <a href="#" class="project-overlay-btn view-project-btn" data-project="${project.project_title}">
                  <i class="fas fa-eye"></i>
                  <span>View</span>
                </a>
              `
                  : ""
              }
              ${
                project.github_repo &&
                project.github_repo !== "https://github.com/yourusername/"
                  ? `
                <a href="#" class="project-overlay-btn view-code-btn" data-project="${project.project_title}" data-repo="${project.github_repo}">
                  <i class="fas fa-code"></i>
                  <span>Code</span>
                </a>
              `
                  : ""
              }
            </div>
         </div>
      </div>
      
      <div class="project-content">
        <h3 class="project-title">${project.project_title}</h3>
        <p class="project-description">${project.description}</p>
        
        <div class="project-technologies">
          ${technologiesList}
        </div>
        

      </div>
    `;

    projectsGrid.appendChild(projectCard);

    // Add event listeners for the buttons
    const viewBtn = projectCard.querySelector(".view-project-btn");
    const codeBtn = projectCard.querySelector(".view-code-btn");

    if (viewBtn) {
      viewBtn.addEventListener("click", function (e) {
        e.preventDefault();
        viewProject(this.dataset.project);
      });
    }

    if (codeBtn) {
      codeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        viewCode(this.dataset.project, this.dataset.repo);
      });
    }

    // Animate cards with delay
    setTimeout(() => {
      projectCard.classList.add("animate-in");
    }, index * 200);
  });

  // Initialize enhanced lazy loading for project images
  enhanceProjectImageLazyLoading();
}

// Project action functions
function viewProject(projectTitle) {
  console.log(`Viewing project: ${projectTitle}`);

  // Find the project data
  const project = projectsData.find((p) => p.project_title === projectTitle);

  if (project && project.showcase && project.showcase.length > 0) {
    // Show modal with project showcase
    showProjectModal(project);
  } else {
    // Show notification if no showcase images available
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f39c12;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fas fa-info-circle"></i>
        <span>Showcase images coming soon for ${projectTitle}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      notification.style.transform = "translateX(400px)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Global variable to store projects data
let projectsData = [];

// Global variable for carousel state
let currentImageIndex = 0;
let currentShowcaseImages = [];

// Modal functions
function showProjectModal(project) {
  const modal = document.getElementById("project-modal");
  const modalTitle = document.getElementById("modal-title");
  const projectShowcase = document.getElementById("project-showcase");

  // Set modal title
  modalTitle.textContent = project.project_title;

  // Clear previous showcase content
  projectShowcase.innerHTML = "";

  // Create showcase container
  const showcaseContainer = document.createElement("div");
  showcaseContainer.className = "showcase-container";

  // Create images wrapper for vertical scrolling
  const imagesWrapper = document.createElement("div");
  imagesWrapper.className = "showcase-images-wrapper";

  // Add showcase images with lazy loading
  project.showcase.forEach((imageName, index) => {
    const showcaseDiv = document.createElement("div");
    showcaseDiv.className = "showcase-image loading";
    showcaseDiv.dataset.index = index;

    // Create image element
    const img = document.createElement("img");
    img.alt = `${project.project_title} showcase ${index + 1}`;

    // Implement lazy loading
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = `project_images/${imageName}`;
            img.classList.remove("loading");
            img.parentElement.classList.remove("loading");
            imageObserver.unobserve(img);
          }
        });
      },
      {
        rootMargin: "50px 0px", // Start loading 50px before image comes into view
        threshold: 0.1,
      }
    );

    // Add error handling for missing images
    img.onerror = function () {
      this.style.display = "none";
      showcaseDiv.innerHTML = `
        <div style="
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 300px;
          background: rgba(255,255,255,0.05); 
          border-radius: 15px;
          color: rgba(255,255,255,0.6);
          font-style: italic;
        ">
          Image not available: ${imageName}
        </div>
      `;
      showcaseDiv.classList.remove("loading");
    };

    // Add load event to remove loading class
    img.onload = function () {
      showcaseDiv.classList.remove("loading");
    };

    showcaseDiv.appendChild(img);
    imagesWrapper.appendChild(showcaseDiv);

    // Start observing the image for lazy loading
    imageObserver.observe(img);
  });

  showcaseContainer.appendChild(imagesWrapper);
  projectShowcase.appendChild(showcaseContainer);

  // Show modal
  modal.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent background scrolling
}

// Vertical scrolling functions - no longer needed for horizontal navigation

function closeProjectModal() {
  const modal = document.getElementById("project-modal");
  modal.classList.remove("active");
  document.body.style.overflow = ""; // Restore scrolling
}

// Modal event listeners
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("project-modal");
  const modalClose = document.getElementById("modal-close");
  const modalOverlay = modal.querySelector(".modal-overlay");

  // Close modal when clicking close button
  modalClose.addEventListener("click", closeProjectModal);

  // Close modal when clicking overlay
  modalOverlay.addEventListener("click", closeProjectModal);

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (modal.classList.contains("active")) {
      if (e.key === "Escape") {
        closeProjectModal();
      }
    }
  });
});

function viewCode(projectTitle, githubRepo) {
  console.log(`Viewing code for: ${projectTitle}`);

  // Check if GitHub repository URL is provided
  if (githubRepo && githubRepo !== "https://github.com/yourusername/") {
    // Open the GitHub repository in a new tab
    window.open(githubRepo, "_blank");

    // Show success notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--secondary-color);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fas fa-code"></i>
        <span>Opening ${projectTitle} repository...</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      notification.style.transform = "translateX(400px)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  } else {
    // Show notification that repository is not available yet
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f39c12;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fas fa-info-circle"></i>
        <span>GitHub repository coming soon for ${projectTitle}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      notification.style.transform = "translateX(400px)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Copy to clipboard function
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(function () {
      // Show success notification
      const notification = document.createElement("div");
      notification.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: var(--secondary-color);
              color: white;
              padding: 1rem 1.5rem;
              border-radius: 10px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.3);
              z-index: 10000;
              transform: translateX(400px);
              transition: transform 0.3s ease;
            `;
      notification.innerHTML = `
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-check-circle"></i>
                <span>Email copied to clipboard!</span>
              </div>
            `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.transform = "translateX(0)";
      }, 100);

      setTimeout(() => {
        notification.style.transform = "translateX(400px)";
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    })
    .catch(function (err) {
      console.error("Could not copy text: ", err);
    });
}

// Initialize experience section when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  loadExperienceData();
  loadProjectsData();
  loadCertificatesData();

  // Initialize scroll animations after content loads
  setTimeout(() => {
    initAllScrollAnimations();
  }, 100);
});

// Load and display certificates
async function loadCertificatesData() {
  try {
    const response = await fetch("data/certificates.json");
    const certificates = await response.json();
    displayCertificates(certificates);
  } catch (error) {
    console.error("Error loading certificates:", error);
  }
}

function displayCertificates(certificates) {
  const certificatesTrack = document.getElementById("certificates-track");

  if (!certificatesTrack) return;

  const certificateHTML = certificates
    .map(
      (certificate) => `
           <div class="certificate-item">
             <div class="certificate-header">
               <div class="certificate-info">
                 <h3 class="certificate-title">${certificate.certificate}</h3>
                 <p class="certificate-issuer">${certificate.issurer}</p>
                 <p class="certificate-year">${certificate.year}</p>
               </div>
             </div>
           </div>
         `
    )
    .join("");

  // Duplicate the certificates within the same track for seamless infinite scroll
  certificatesTrack.innerHTML = certificateHTML + certificateHTML;
}

// Initialize all scroll animations (consolidated)
function initAllScrollAnimations() {
  // Add scroll-animate class to elements that should animate
  const animateElements = document.querySelectorAll(`
    .project-card,
    .experience-item,
    .skill-card,
    .certificate-item,
    .platform-card,
    .detail-item,
    .feature-item,
    .stat-group,
    .bento-item,
    .about-image,
    .about-text,
    .section-header,
    .about-section,
    .experience-section,
    .projects-section,
    .about-skill,
    .certificate-section,
    .contact-section
  `);

  animateElements.forEach((el) => {
    el.classList.add("scroll-animate");
  });

  // Add stagger-animate class to grid items
  const gridItems = document.querySelectorAll(`
    .projects-grid .project-card,
    .skills-grid .skill-card,
    .contact-platforms .platform-card,
    .about-details .detail-item
  `);

  gridItems.forEach((el) => {
    el.classList.add("stagger-animate");
  });
}

// Enhanced lazy loading for all images
document.addEventListener("DOMContentLoaded", function () {
  // Initialize lazy loading for all images with loading="lazy"
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add("loaded");
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: "50px 0px",
      threshold: 0.1,
    }
  );

  lazyImages.forEach((img) => {
    imageObserver.observe(img);
  });

  // Initialize scroll animations first
  initAllScrollAnimations();

  // Wait a bit for DOM to settle, then start observing
  setTimeout(() => {
    // Only run scroll animations on desktop devices
    if (window.innerWidth > 768) {
      // Scroll animations (fade, stagger, parallax) with IntersectionObserver
      const options = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const el = entry.target;

            // Normal fade/slide
            if (el.classList.contains("scroll-animate")) {
              el.classList.add("animate-in");
            }

            // Staggered reveal
            if (el.classList.contains("stagger-animate")) {
              setTimeout(() => {
                el.classList.add("animate-in");
              }, index * 150);
            }

            observer.unobserve(el); // animate only once
          }
        });
      }, options);

      // Observe elements that have the animation classes
      document
        .querySelectorAll(".scroll-animate, .stagger-animate")
        .forEach((el) => {
          observer.observe(el);
        });
    } else {
      // On mobile, immediately show all elements without animation
      document
        .querySelectorAll(".scroll-animate, .stagger-animate")
        .forEach((el) => {
          el.classList.add("animate-in");
        });
    }
  }, 100);

  // Parallax effect for background elements
  const parallaxElements = document.querySelectorAll(".parallax-bg");
  if (parallaxElements.length > 0) {
    let ticking = false;

    function updateParallax() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPosition = window.pageYOffset;
          parallaxElements.forEach((el) => {
            const speed = el.dataset.speed || 0.5;
            const yPos = -(scrollPosition * speed);
            el.style.transform = `translateY(${yPos}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", updateParallax, { passive: true });
  }
});

// Enhanced lazy loading for dynamically loaded project images
function enhanceProjectImageLazyLoading() {
  const projectImages = document.querySelectorAll(
    '.project-image img[loading="lazy"]'
  );

  const projectImageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add("loaded");
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: "100px 0px",
      threshold: 0.1,
    }
  );

  projectImages.forEach((img) => {
    projectImageObserver.observe(img);
  });
}

// CV Download Warning Function
function showCVWarning() {
  // Show notification for CV download warning
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f59e0b; /* Warning color */
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
  `;
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <i class="fas fa-exclamation-triangle"></i>
      <span>Sorry, you cannot download the CV due to security reasons. Please contact me directly for my resume.</span>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000); // Auto-dismiss after 5 seconds
}

// Certificate carousel — JS-driven scroll with smooth deceleration on hover
(function initCertificateCarousel() {
  const NORMAL_SPEED = 0.6; // px per frame (~36px/s at 60fps)
  const LERP_FACTOR = 0.04; // lower = smoother / slower ease

  let position = 0;
  let currentSpeed = NORMAL_SPEED;
  let targetSpeed = NORMAL_SPEED;

  function startCarousel() {
    const track = document.getElementById("certificates-track");
    const container = document.querySelector(".certificates-scroll-container");
    if (!track || !container) return;

    container.addEventListener("mouseenter", () => {
      targetSpeed = 0;
    });
    container.addEventListener("mouseleave", () => {
      targetSpeed = NORMAL_SPEED;
    });

    function tick() {
      // Lerp current speed toward target for smooth ease
      currentSpeed += (targetSpeed - currentSpeed) * LERP_FACTOR;

      position -= currentSpeed;

      // Seamless loop: content is duplicated, so reset at 50% of total width
      const halfWidth = track.scrollWidth / 2;
      if (Math.abs(position) >= halfWidth) {
        position += halfWidth;
      }

      track.style.transform = `translateX(${position}px)`;
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // Wait for certificates to load before starting
  document.addEventListener("DOMContentLoaded", () => {
    // Certificates are loaded async, so give them a moment to render
    setTimeout(startCarousel, 300);
  });
})();
