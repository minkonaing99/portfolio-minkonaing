document.addEventListener("DOMContentLoaded", () => {
  // Mark page as loaded
  setTimeout(() => {
    document.body.classList.add("loaded");
  }, 100);

  // Load dynamic data
  loadExperienceData();
  loadProjectsData();
  loadCertificatesData();

  // Initialize experience display
  updateExperienceCountdown();
  setInterval(updateExperienceCountdown, 24 * 60 * 60 * 1000);

});
