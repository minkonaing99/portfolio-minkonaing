document.addEventListener("DOMContentLoaded", () => {
  // Mark page as loaded
  setTimeout(() => {
    document.body.classList.add("loaded");
  }, 100);

  // Load dynamic data (only the loaders present on this page)
  if (typeof loadExperienceData === "function") loadExperienceData();
  if (typeof loadProjectsData === "function") loadProjectsData();
  if (typeof loadCertificatesData === "function") loadCertificatesData();

  // Initialize experience display
  if (typeof updateExperienceCountdown === "function") {
    updateExperienceCountdown();
    setInterval(updateExperienceCountdown, 24 * 60 * 60 * 1000);
  }
});
