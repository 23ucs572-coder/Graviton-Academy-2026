(function () {
  const header = document.querySelector(".site-header");
  const brand = document.querySelector(".brand");
  const root = document.documentElement;
  const menuToggle = document.getElementById("menuToggle");
  const siteNav = document.getElementById("siteNav");
  const navLinks = document.querySelectorAll(".site-nav a");
  const revealItems = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll("[data-count]");
  const contactForm = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");
  const floatingCta = document.querySelector(".floating-cta");
  const siteVideo = document.querySelector(".site-video");
  const openingBrand = document.querySelector(".opening-brand");
  const openingName = document.querySelector(".opening-name");
  const openingNameWrap = document.querySelector(".opening-name-wrap");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const openingNameText = openingName ? openingName.textContent.trim() : "";

  function finishOpening() {
    if (!document.body.classList.contains("is-opening")) return;

    if (document.querySelector(".opening-screen")) {
      document.querySelector(".opening-screen").classList.add("is-curtain-close");
    }

    document.body.classList.add("opening-complete");

    document.body.classList.remove("is-opening");
    document.body.classList.remove("opening-ready");

    if (siteVideo) {
      siteVideo.play().catch(function () {});
    }
  }

  function initOpeningEffect() {
    if (!document.body.classList.contains("is-opening")) return;

    if (prefersReducedMotion) {
      finishOpening();
      return;
    }

    const animationDuration = 1700;

    function startOpeningAnimation() {
      if (openingName && openingNameText) {
        openingName.textContent = "";
      }

      if (openingNameWrap) {
        openingNameWrap.style.width = "0px";
        openingNameWrap.style.opacity = "0";
      }

      if (openingBrand) {
        openingBrand.addEventListener("animationend", function (event) {
          if (event.animationName === "openingBrandExit") {
            finishOpening();
          }
        }, { once: true });
      }

      requestAnimationFrame(function () {
        document.body.classList.add("opening-ready");

        const openingScreen = document.querySelector(".opening-screen");
        if (openingScreen) {
          openingScreen.classList.add("is-curtain-open");
        }

        window.setTimeout(function () {
          document.body.classList.add("opening-typing");

          if (!openingName || !openingNameText) {
            window.setTimeout(finishOpening, animationDuration);
            return;
          }

          let index = 0;
          const chars = Array.from(openingNameText);
          const tick = 18;

          function typeNext() {
            index += 1;
            requestAnimationFrame(function () {
              openingName.textContent = chars.slice(0, index).join("");
              if (openingNameWrap) {
                openingNameWrap.style.width = Math.ceil(openingName.scrollWidth) + "px";
                openingNameWrap.style.opacity = "1";
              }
            });

            if (index < chars.length) {
              requestAnimationFrame(() => {
                window.setTimeout(typeNext, tick);
              });
              return;
            }

            window.setTimeout(finishOpening, 760);
          }

          typeNext();
        }, 240);
      });
    }

    startOpeningAnimation();
  }

  function syncHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  function syncFloatingCta() {
    if (!floatingCta) return;
    if (window.innerWidth > 760) {
      floatingCta.classList.remove("is-visible");
      return;
    }
    floatingCta.classList.toggle("is-visible", window.scrollY > 380);
  }

  function attachHeaderCursorEffect() {
    if (!header) return;
    let frame = null;
    let nextX = 50;
    let nextY = 50;

    function applyHeaderCursor() {
      header.style.setProperty("--header-cursor-x", `${nextX}%`);
      header.style.setProperty("--header-cursor-y", `${nextY}%`);
      frame = null;
    }

    function updateHeaderCursor(event) {
      const rect = header.getBoundingClientRect();
      nextX = ((event.clientX - rect.left) / rect.width) * 100;
      nextY = ((event.clientY - rect.top) / rect.height) * 100;

      if (frame === null) {
        frame = requestAnimationFrame(applyHeaderCursor);
      }
    }

    header.addEventListener("pointerenter", function (event) {
      header.classList.add("is-hovered");
      updateHeaderCursor(event);
    });

    header.addEventListener("pointermove", updateHeaderCursor, { passive: true });

    header.addEventListener("pointerleave", function () {
      header.classList.remove("is-hovered");
    });
  }

  function closeMenu() {
    if (!siteNav || !menuToggle) return;
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", function () {
      const isOpen = siteNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + id);
        });
      });
    },
    {
      rootMargin: "-35% 0px -45% 0px",
      threshold: 0.1
    }
  );

  document.querySelectorAll("main section[id]").forEach(function (section) {
    sectionObserver.observe(section);
  });

  // Set the active link based on current scroll position and page load
  function updateActiveLink() {
    const homeSection = document.querySelector("#home");
    const sections = document.querySelectorAll("main section[id]");
    let currentSection = null;
    
    // Check if we're at the top of the page (home section)
    if (window.scrollY < 200) {
      currentSection = "home";
    } else {
      // Find which section is currently visible
      sections.forEach(function (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) {
          currentSection = section.getAttribute("id");
        }
      });
    }

    // Default to home if nothing is detected
    if (!currentSection) {
      currentSection = "home";
    }

    navLinks.forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === "#" + currentSection) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  // Initialize active link immediately
  updateActiveLink();
  
  // Update active link on scroll
  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("load", updateActiveLink);

  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15
    }
  );

  revealItems.forEach(function (item) {
    revealObserver.observe(item);
  });

  const counterObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        const target = Number(element.getAttribute("data-count") || 0);
        const duration = 1400;
        const startTime = performance.now();

        function step(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const current = Math.round(target * progress);
          element.textContent = String(current);

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            element.textContent = String(target);
          }
        }

        requestAnimationFrame(step);
        observer.unobserve(element);
      });
    },
    {
      threshold: 0.6
    }
  );

  counters.forEach(function (counter) {
    counterObserver.observe(counter);
  });

  if (contactForm) {
    contactForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const formData = new FormData(contactForm);
      if (formData.get("honeypot")) return;

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(Object.fromEntries(formData.entries()))
        });

        const result = await response.json();
        if (formNote) {
          formNote.textContent = result.message || "Enquiry sent successfully.";
        }
        contactForm.reset();
      } catch (error) {
        if (formNote) {
          formNote.textContent = "Enquiry form is ready, but the mail server is not configured yet.";
        }
      }
    });
  }

  window.addEventListener("scroll", syncHeaderState, { passive: true });
  window.addEventListener("scroll", syncFloatingCta, { passive: true });
  window.addEventListener("resize", closeMenu);
  window.addEventListener("resize", syncFloatingCta);
  attachHeaderCursorEffect();
  initOpeningEffect();
  syncHeaderState();
  syncFloatingCta();
})();
