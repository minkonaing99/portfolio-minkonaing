// Experience display
function updateExperienceCountdown() {
  const el = document.getElementById("experience-display");
  if (!el) return;

  const startDate = new Date("2024-06-01");
  const now = new Date();
  const totalDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  const totalMonths = totalDays / 30.44;

  let text;
  if (totalMonths < 1) {
    text = "Just Started";
  } else if (totalMonths < 12) {
    const m = Math.floor(totalMonths);
    text = `${m}+ Month${m > 1 ? "s" : ""}`;
  } else {
    const years = totalDays / 365.25;
    const nextYear = Math.ceil(years);
    const diff = nextYear - years;
    if (diff < 0.08) {
      text = `${nextYear} Years`;
    } else if (diff < 0.35) {
      text = `Almost ${nextYear} Years`;
    } else {
      const y = Math.floor(years);
      text = `${y}+ Year${y > 1 ? "s" : ""}`;
    }
  }

  el.textContent = text;
}


// CTA button ripple effect
document.addEventListener("DOMContentLoaded", () => {
  const ctaButton = document.querySelector(".cta-button");
  if (ctaButton) {
    ctaButton.addEventListener("click", (e) => {
      const ripple = document.createElement("span");
      const rect = ctaButton.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = e.clientX - rect.left - size / 2 + "px";
      ripple.style.top = e.clientY - rect.top - size / 2 + "px";
      ripple.classList.add("ripple");
      ctaButton.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }
});
