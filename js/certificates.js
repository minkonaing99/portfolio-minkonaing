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

  // Duplicate for seamless infinite scroll
  certificatesTrack.innerHTML = certificateHTML + certificateHTML;
}

// Certificate carousel — JS-driven scroll with smooth deceleration on hover
(function initCertificateCarousel() {
  const NORMAL_SPEED = 0.6;
  const LERP_FACTOR = 0.04;

  let position = 0;
  let currentSpeed = NORMAL_SPEED;
  let targetSpeed = NORMAL_SPEED;

  function startCarousel() {
    const track = document.getElementById("certificates-track");
    const container = document.querySelector(".certificates-scroll-container");
    if (!track || !container) return;

    container.addEventListener("mouseenter", () => { targetSpeed = 0; });
    container.addEventListener("mouseleave", () => { targetSpeed = NORMAL_SPEED; });

    function tick() {
      currentSpeed += (targetSpeed - currentSpeed) * LERP_FACTOR;
      position -= currentSpeed;

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
    setTimeout(startCarousel, 300);
  });
})();
