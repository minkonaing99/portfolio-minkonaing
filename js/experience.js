async function loadExperienceData() {
  try {
    const response = await fetch("data/experience.json");
    if (!response.ok) throw new Error(`Experience request failed: ${response.status}`);

    const experienceData = await response.json();
    if (!Array.isArray(experienceData)) throw new TypeError("Experience data must be an array");

    displayExperience(experienceData);
  } catch (error) {
    console.error("Error loading experience data:", error);
  }
}

function cleanExperienceText(value) {
  return typeof value === "string" ? value.trim().slice(0, 500) : "";
}

function createExperienceItem(experience) {
  const source = experience && typeof experience === "object" ? experience : {};
  const item = document.createElement("div");
  const content = document.createElement("div");
  const position = document.createElement("h3");
  const company = document.createElement("p");
  const duration = document.createElement("p");
  const tooltip = document.createElement("div");
  const tooltipContent = document.createElement("div");
  const heading = document.createElement("h4");
  const responsibilities = document.createElement("ul");
  const items = Array.isArray(source.responsibilities) ? source.responsibilities : [];

  item.className = "experience-item";
  content.className = "experience-content";
  position.className = "experience-position";
  company.className = "experience-company";
  duration.className = "experience-duration";
  tooltip.className = "experience-tooltip";
  tooltipContent.className = "tooltip-content";
  position.textContent = cleanExperienceText(source.position);
  company.textContent = cleanExperienceText(source.company);
  duration.textContent = cleanExperienceText(source.duration);
  heading.textContent = "Responsibilities:";
  items.forEach((responsibility) => {
    const listItem = document.createElement("li");
    listItem.textContent = cleanExperienceText(responsibility);
    responsibilities.appendChild(listItem);
  });
  content.append(position, company, duration);
  tooltipContent.append(heading, responsibilities);
  tooltip.appendChild(tooltipContent);
  item.append(content, tooltip);
  return item;
}

function displayExperience(experienceData) {
  const timeline = document.getElementById("experience-timeline");
  if (!timeline || !Array.isArray(experienceData)) return;

  timeline.replaceChildren();
  experienceData.forEach((experience, index) => {
    const experienceItem = createExperienceItem(experience);
    const experienceContent = experienceItem.querySelector(".experience-content");
    const tooltip = experienceItem.querySelector(".experience-tooltip");

    experienceContent.addEventListener("click", () => {
      document.querySelectorAll(".experience-tooltip").forEach((item) => {
        if (item !== tooltip) item.classList.remove("active");
      });
      tooltip.classList.toggle("active");
    });
    document.addEventListener("click", (event) => {
      if (!experienceContent.contains(event.target) && !tooltip.contains(event.target)) {
        tooltip.classList.remove("active");
      }
    });
    setTimeout(() => experienceItem.classList.add("animate-in"), index * 200);
    timeline.appendChild(experienceItem);
  });
}
