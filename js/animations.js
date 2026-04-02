function initAllScrollAnimations() {
  const animateElements = document.querySelectorAll(`
    .project-card,
    .experience-item,
    .skill-card,
    .certificate-item,
    .platform-card,
    .detail-item,
    .feature-item,
    .bento-item,
    .about-image,
    .about-text,
    .section-header,
    .about-section,
    .experience-section,
    .projects-section,
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
  if (window.innerWidth > 768) {
    // Trigger when 8% of the element enters the viewport (earlier = less jarring)
    const options = { threshold: 0.08, rootMargin: "0px 0px -20px 0px" };

    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // CSS nth-child transition-delay handles stagger, no JS setTimeout needed
          entry.target.classList.add("animate-in");
          scrollObserver.unobserve(entry.target);
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
