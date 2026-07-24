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
      <div class="experience-when">
        <p class="experience-duration">${experience.duration}</p>
        <p class="experience-company">${experience.company}</p>
      </div>
      <div class="experience-body">
        <h3 class="experience-position">${experience.position}</h3>
        <ul class="experience-duties">${responsibilitiesList}</ul>
      </div>
    `;

    timeline.appendChild(experienceItem);

    setTimeout(() => {
      experienceItem.classList.add("animate-in");
    }, index * 120);
  });
}
