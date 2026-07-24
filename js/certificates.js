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
      <a class="certificate-item" href="${certificate.url}" target="_blank" rel="noopener noreferrer">
        <div class="certificate-meta">
          <span class="certificate-issuer">${certificate.issurer}</span>
          <span class="certificate-year">${certificate.year}</span>
        </div>
        <h3 class="certificate-title">${certificate.certificate}</h3>
      </a>
    `
    )
    .join("");

  // Duplicate for seamless infinite scroll
  certificatesTrack.innerHTML = certificateHTML + certificateHTML;

  // Signal that DOM is ready for the carousel to start
  document.dispatchEvent(new Event("certificates-loaded"));
}

// Certificate carousel: delta-time based for consistent speed across all refresh rates
(function initCertificateCarousel() {
  const SPEED_PX_PER_SEC = 60; // pixels per second, frame-rate independent
  const LERP_FACTOR = 0.08;    // higher = snappier hover pause/resume

  let position = 0;
  let currentSpeed = 0;        // eases in from 0 on start
  let targetSpeed = SPEED_PX_PER_SEC;
  let lastTime = null;

  function startCarousel() {
    const track = document.getElementById("certificates-track");
    const container = document.querySelector(".certificates-scroll-container");
    if (!track || !container) return;

    container.addEventListener("mouseenter", () => { targetSpeed = 0; });
    container.addEventListener("mouseleave", () => { targetSpeed = SPEED_PX_PER_SEC; });

    function tick(timestamp) {
      if (lastTime === null) lastTime = timestamp;
      const delta = Math.min((timestamp - lastTime) / 1000, 0.05); // seconds, capped to avoid jump on tab focus
      lastTime = timestamp;

      currentSpeed += (targetSpeed - currentSpeed) * LERP_FACTOR;
      position -= currentSpeed * delta;

      const halfWidth = track.scrollWidth / 2;
      if (Math.abs(position) >= halfWidth) {
        position += halfWidth;
      }

      track.style.transform = `translateX(${position}px)`;
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // Start after certificates are injected into the DOM
  document.addEventListener("certificates-loaded", startCarousel);
})();
