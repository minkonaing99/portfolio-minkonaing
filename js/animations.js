// GSAP-driven motion. Static content is the fallback: when GSAP is
// missing or the user prefers reduced motion, the js gate is removed
// and everything renders instantly.

const MOTION_ON =
  typeof window.gsap !== "undefined" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!MOTION_ON) {
  document.documentElement.classList.remove("js");
}

// Elements present in static HTML that reveal on scroll
const REVEAL_SELECTORS = [
  ".section-header",
  ".about-image",
  ".about-text",
  ".contact-left",
  ".contact-right",
  ".footer-brand",
];

let revealObserver = null;

if (MOTION_ON) {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          });
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
  );
}

// Shared with experience.js / projects.js for injected elements
window.revealOnScroll = function (el) {
  if (!MOTION_ON || !revealObserver) return;
  gsap.set(el, { autoAlpha: 0, y: 24 });
  revealObserver.observe(el);
};

function initScrollReveals() {
  document
    .querySelectorAll(REVEAL_SELECTORS.join(","))
    .forEach((el) => window.revealOnScroll(el));
}

function initHeroIntro() {
  if (!document.querySelector(".hero-title")) return;

  const tl = gsap.timeline({
    defaults: { ease: "expo.out", duration: 0.9 },
  });

  tl.set(".hero-gate", { visibility: "inherit" })
    .from(".hero-meta-item", { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.1)
    .from(".hero-line-inner", { yPercent: 110, stagger: 0.12, duration: 1 }, 0.25)
    .from(".hero-figure", { autoAlpha: 0, scale: 0.96, transformOrigin: "center", duration: 1.1 }, 0.45)
    .from(".hero-intro", { y: 24, autoAlpha: 0 }, 0.6)
    .from(".hero-actions", { y: 24, autoAlpha: 0 }, 0.7)
    .from(".hero-spec-row", { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.65);

  const count = document.getElementById("project-count");
  if (count) {
    const counter = { n: 0 };
    tl.to(
      counter,
      {
        n: 17,
        duration: 1,
        ease: "power2.out",
        onUpdate: () => {
          count.textContent = Math.round(counter.n);
        },
      },
      0.75
    );
  }
}

function initDialMotion() {
  const sweep = document.querySelector(".dial-sweep");
  if (!sweep) return;

  const sweepTween = gsap.to(sweep, {
    rotation: 360,
    duration: 30,
    ease: "none",
    repeat: -1,
    svgOrigin: "160 160",
  });

  const arcTween = gsap.to(".dial-arc", {
    strokeDashoffset: "-=32",
    duration: 5,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });

  // Idle loops pause while the hero is offscreen
  const hero = document.querySelector(".hero-section");
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        sweepTween.play();
        arcTween.play();
      } else {
        sweepTween.pause();
        arcTween.pause();
      }
    });
  }).observe(hero);
}

function initLazyImages() {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("loaded");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "50px 0px", threshold: 0.1 }
  );

  lazyImages.forEach((img) => imageObserver.observe(img));
}

document.addEventListener("DOMContentLoaded", function () {
  initLazyImages();

  if (!MOTION_ON) return;

  initHeroIntro();
  initDialMotion();
  initScrollReveals();
});
