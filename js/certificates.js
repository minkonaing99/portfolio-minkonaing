// Certificates as a chronological ledger: one lane per year, each cert a
// marker on that year's axis. Static content is the fallback; GSAP only
// choreographs the reveal.

const CERT_MOTION_ON =
  typeof window.gsap !== "undefined" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function loadCertificatesData() {
  try {
    const response = await fetch("data/certificates.json");
    const certificates = await response.json();
    renderCertificates(certificates);
  } catch (error) {
    console.error("Error loading certificates:", error);
  }
}

function renderCertificates(certificates) {
  const root = document.getElementById("cert-ledger");
  if (!root) return;

  const byYear = {};
  certificates.forEach((cert) => {
    (byYear[cert.year] = byYear[cert.year] || []).push(cert);
  });

  const years = Object.keys(byYear).sort();
  root.innerHTML = years.map((year) => laneHTML(year, byYear[year])).join("");

  initCertMotion(root);
}

function laneHTML(year, items) {
  const cells = items
    .map(
      (cert) => `
      <a class="cert-item" href="${cert.url}" target="_blank" rel="noopener noreferrer">
        <span class="cert-marker" aria-hidden="true"></span>
        <span class="cert-item-body">
          <span class="cert-item-title">${cert.certificate}</span>
          <span class="cert-item-issuer">${cert.issurer}</span>
          <span class="cert-item-verify">Verify ↗</span>
        </span>
      </a>`
    )
    .join("");

  return `
    <div class="cert-lane">
      <div class="cert-year">${year}</div>
      <div class="cert-track">
        <span class="cert-axis" aria-hidden="true"></span>
        ${cells}
      </div>
    </div>`;
}

function initCertMotion(root) {
  const lanes = root.querySelectorAll(".cert-lane");
  if (!CERT_MOTION_ON) return;

  lanes.forEach((lane) => {
    gsap.set(lane.querySelector(".cert-axis"), {
      scaleX: 0,
      transformOrigin: "left center",
    });
    gsap.set(lane.querySelectorAll(".cert-marker"), { scale: 0.2, autoAlpha: 0 });
    gsap.set(lane.querySelectorAll(".cert-item-body"), { autoAlpha: 0, y: 12 });
    gsap.set(lane.querySelector(".cert-year"), { autoAlpha: 0, x: -8 });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const lane = entry.target;

        gsap
          .timeline()
          .to(lane.querySelector(".cert-year"), {
            autoAlpha: 1,
            x: 0,
            duration: 0.5,
            ease: "power3.out",
          })
          .to(
            lane.querySelector(".cert-axis"),
            { scaleX: 1, duration: 0.7, ease: "power3.out" },
            "<"
          )
          .to(
            lane.querySelectorAll(".cert-marker"),
            { scale: 1, autoAlpha: 1, stagger: 0.08, duration: 0.4, ease: "back.out(2)" },
            "-=0.45"
          )
          .to(
            lane.querySelectorAll(".cert-item-body"),
            { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5, ease: "power3.out" },
            "<"
          );

        observer.unobserve(lane);
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -40px 0px" }
  );

  lanes.forEach((lane) => observer.observe(lane));
}
