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
          <ul>${responsibilitiesList}</ul>
        </div>
      </div>
    `;

    timeline.appendChild(experienceItem);

    const experienceContent = experienceItem.querySelector(".experience-content");
    const tooltip = experienceItem.querySelector(".experience-tooltip");

    experienceContent.addEventListener("click", function () {
      document.querySelectorAll(".experience-tooltip").forEach((t) => {
        if (t !== tooltip) t.classList.remove("active");
      });
      tooltip.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
      if (!experienceContent.contains(e.target) && !tooltip.contains(e.target)) {
        tooltip.classList.remove("active");
      }
    });

    setTimeout(() => {
      experienceItem.classList.add("animate-in");
    }, index * 200);
  });
}
