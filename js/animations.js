function initAllScrollAnimations() {
  const animateElements = document.querySelectorAll(`
    .project-card,
    .experience-item,
    .skill-card,
    .certificate-item,
    .platform-card,
    .detail-item,
    .feature-item,
    .stat-group,
    .bento-item,
    .about-image,
    .about-text,
    .section-header,
    .about-section,
    .experience-section,
    .projects-section,
    .about-skill,
    .certificate-section,
    .contact-section
  `);

  animateElements.forEach((el) => el.classList.add("scroll-animate"));

  const gridItems = document.querySelectorAll(`
    .projects-grid .project-card,
    .skills-grid .skill-card,
    .contact-platforms .platform-card,
    .about-details .detail-item
  `);

  gridItems.forEach((el) => el.classList.add("stagger-animate"));
}

document.addEventListener("DOMContentLoaded", function () {
  // Add scroll-animate classes to elements before the observer starts
  initAllScrollAnimations();

  // Lazy loading for static images
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

  // Scroll reveal animations
  setTimeout(() => {
    if (window.innerWidth > 768) {
      const options = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };

      const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.classList.contains("scroll-animate")) {
              el.classList.add("animate-in");
            }
            if (el.classList.contains("stagger-animate")) {
              setTimeout(() => el.classList.add("animate-in"), index * 150);
            }
            scrollObserver.unobserve(el);
          }
        });
      }, options);

      document.querySelectorAll(".scroll-animate, .stagger-animate").forEach((el) => {
        scrollObserver.observe(el);
      });
    } else {
      // On mobile, show all elements immediately without animation
      document.querySelectorAll(".scroll-animate, .stagger-animate").forEach((el) => {
        el.classList.add("animate-in");
      });
    }
  }, 100);

  // Parallax effect for background elements
  const parallaxElements = document.querySelectorAll(".parallax-bg");
  if (parallaxElements.length > 0) {
    let parallaxTicking = false;

    function updateParallax() {
      if (!parallaxTicking) {
        requestAnimationFrame(() => {
          const scrollPosition = window.pageYOffset;
          parallaxElements.forEach((el) => {
            const speed = el.dataset.speed || 0.5;
            el.style.transform = `translateY(${-(scrollPosition * speed)}px)`;
          });
          parallaxTicking = false;
        });
        parallaxTicking = true;
      }
    }

    window.addEventListener("scroll", updateParallax, { passive: true });
  }
});
