// Experience countdown
function updateExperienceCountdown() {
  const startDate = new Date("2024-06-01");
  const currentDate = new Date();
  const timeDiff = currentDate - startDate;
  const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));
  const months = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44)
  );
  const days = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24)
  );
  animateExperienceDisplay(years, months, days, timeDiff);
}

function animateExperienceDisplay(years, months, days, timeDiff) {
  const countdownElement = document.getElementById("experience-countdown");
  if (!countdownElement) return;

  if (timeDiff < 1000 * 60 * 60 * 24) {
    countdownElement.textContent = "Just Started";
    return;
  }

  const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  let currentDay = 0;

  const animate = () => {
    if (currentDay <= totalDays) {
      let displayText = "";

      if (currentDay === 0) {
        displayText = "0 Days";
      } else if (currentDay < 365) {
        displayText = `${currentDay} ${currentDay === 1 ? "Day" : "Days"}`;
      } else {
        const yrs = Math.floor(currentDay / 365);
        const remainingDays = currentDay % 365;
        if (remainingDays === 0) {
          displayText = `${yrs} ${yrs === 1 ? "Year" : "Years"}`;
        } else {
          displayText = `${yrs} ${yrs === 1 ? "Year" : "Years"} & ${remainingDays}\u00A0${remainingDays === 1 ? "Day" : "Days"}`;
        }
      }

      countdownElement.textContent = displayText;
      currentDay++;

      const totalDuration = 300;
      const remainingSteps = totalDays - currentDay;
      const timePerStep = remainingSteps > 0 ? totalDuration / remainingSteps : 0;
      const dynamicSpeed = Math.max(1, Math.min(20, timePerStep));
      setTimeout(animate, dynamicSpeed);
    }
  };

  setTimeout(animate, 500);
}

// Projects counter animation
function animateProjectsCounter() {
  const projectsElement = document.querySelector(".stat-group.projects h3");
  if (!projectsElement) return;

  const targetNumber = 20;
  let currentNumber = 0;
  const increment = Math.ceil(targetNumber / 50);
  const stepDuration = 2000 / 50;

  const animate = () => {
    if (currentNumber < targetNumber) {
      currentNumber = Math.min(currentNumber + increment, targetNumber);
      projectsElement.textContent = `More than ${currentNumber}`;
      setTimeout(animate, stepDuration);
    }
  };

  setTimeout(animate, 1000);
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
