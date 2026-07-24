let experienceData = [];
let activeExperience = 0;

const EXP_MOTION_ON =
  typeof window.gsap !== "undefined" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function loadExperienceData() {
  try {
    const response = await fetch("data/experience.json");
    experienceData = await response.json();
    displayExperience(experienceData);
  } catch (error) {
    console.error("Error loading experience data:", error);
  }
}

function displayExperience(data) {
  const timeline = document.getElementById("experience-timeline");
  if (!timeline || data.length === 0) return;

  const tabs = data
    .map(
      (job, i) => `
      <button class="exp-tab${i === 0 ? " active" : ""}" data-index="${i}"
        aria-current="${i === 0 ? "true" : "false"}">
        <span class="exp-tab-index">${String(i + 1).padStart(2, "0")}</span>
        <span class="exp-tab-text">
          <span class="exp-tab-position">${job.position}</span>
          <span class="exp-tab-duration">${job.duration}</span>
        </span>
      </button>`
    )
    .join("");

  timeline.innerHTML = `
    <div class="exp-console">
      <div class="exp-list">${tabs}</div>
      <div class="exp-detail" aria-live="polite"></div>
    </div>
  `;

  renderExperienceDetail(0, false);

  timeline.querySelectorAll(".exp-tab").forEach((tab) => {
    tab.addEventListener("click", () => selectExperience(Number(tab.dataset.index)));
  });

  timeline.querySelector(".exp-list").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const next =
      e.key === "ArrowDown"
        ? Math.min(activeExperience + 1, experienceData.length - 1)
        : Math.max(activeExperience - 1, 0);
    selectExperience(next);
    timeline.querySelectorAll(".exp-tab")[next].focus();
  });

  if (window.revealOnScroll) {
    window.revealOnScroll(timeline.querySelector(".exp-console"));
  }
}

function experienceDetailHTML(job) {
  const duties = job.responsibilities
    ? job.responsibilities.map((r) => `<li class="exp-duty">${r}</li>`).join("")
    : "";
  return `
    <h3 class="exp-detail-position">${job.position}</h3>
    <p class="exp-detail-meta">
      <span>${job.company}</span>
      <span class="exp-detail-duration">${job.duration}</span>
    </p>
    <ul class="exp-duties">${duties}</ul>
  `;
}

function renderExperienceDetail(index, animate) {
  const detail = document.querySelector(".exp-detail");
  if (!detail) return;

  const swap = () => {
    detail.innerHTML = experienceDetailHTML(experienceData[index]);
    if (animate && EXP_MOTION_ON) {
      gsap.fromTo(
        detail.querySelectorAll(".exp-detail-position, .exp-detail-meta"),
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out", stagger: 0.05 }
      );
      gsap.fromTo(
        detail.querySelectorAll(".exp-duty"),
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.05, delay: 0.08 }
      );
    }
  };

  if (animate && EXP_MOTION_ON) {
    gsap.to(detail.children, {
      autoAlpha: 0,
      y: -8,
      duration: 0.15,
      ease: "power2.in",
      onComplete: swap,
    });
  } else {
    swap();
  }
}

function selectExperience(index) {
  if (index === activeExperience) return;
  activeExperience = index;

  document.querySelectorAll(".exp-tab").forEach((tab, i) => {
    tab.classList.toggle("active", i === index);
    tab.setAttribute("aria-current", i === index ? "true" : "false");
  });

  renderExperienceDetail(index, true);
}
