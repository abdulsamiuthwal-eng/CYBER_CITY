/* =========================================
   CYBERCITY 2050 — MAIN APP JS
   ========================================= */

// --- LOADER ---
window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("hide");
  }, 2400);
});

// --- NAVBAR HIDE AFTER HERO SECTION ---
const navbar = document.getElementById("navbar");
const heroSection = document.getElementById("hero");

window.addEventListener("scroll", () => {
  const heroHeight = heroSection ? heroSection.offsetHeight : 600;
  if (window.scrollY > heroHeight - 80) {
    navbar && navbar.classList.add("nav-hidden");
  } else {
    navbar && navbar.classList.remove("nav-hidden");
    if (window.scrollY > 60) {
      navbar && navbar.classList.add("scrolled");
    } else {
      navbar && navbar.classList.remove("scrolled");
    }
  }
});

// --- HAMBURGER MENU ---
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("nav-links");
hamburger && hamburger.addEventListener("click", () => {
  navLinks && navLinks.classList.toggle("open");
});

// --- REVEAL ON SCROLL ---
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("revealed");
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// --- COUNTER ANIMATION ---
function animateCounter(el, target, duration = 2000) {
  const suffix = el.dataset.suffix || "";
  const isFloat = target.toString().includes(".");
  const start = 0;
  const startTime = performance.now();
  const update = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;
    const formatted = isFloat
      ? current.toFixed(1)
      : Math.floor(current).toLocaleString();
    el.textContent = formatted + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = (isFloat ? target.toFixed(1) : target.toLocaleString()) + suffix;
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = "true";
      const target = parseFloat(entry.target.dataset.target);
      if (!isNaN(target)) animateCounter(entry.target, target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll(".stat-value, .counter").forEach(el => counterObserver.observe(el));

// --- SMOOTH SCROLL for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      navLinks && navLinks.classList.remove("open");
    }
  });
});

// --- ACTIVE NAV LINK ---
const sections = document.querySelectorAll("section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + current);
  });
});


// --- HERO DUAL VIDEO SEAMLESS LOOP CONTROLLER ---
document.addEventListener("DOMContentLoaded", () => {
  const v1 = document.getElementById("hero-video-1");
  const v2 = document.getElementById("hero-video-2");

  if (v1 && v2) {
    v1.load();
    v2.load();

    // Cross-fade to Video 2 when Video 1 ends
    v1.addEventListener("ended", () => {
      v2.currentTime = 0;
      v2.play().then(() => {
        v2.classList.add("active");
        v1.classList.remove("active");
      }).catch(e => console.log("Video 2 play error:", e));
    });

    // Cross-fade to Video 1 when Video 2 ends
    v2.addEventListener("ended", () => {
      v1.currentTime = 0;
      v1.play().then(() => {
        v1.classList.add("active");
        v2.classList.remove("active");
      }).catch(e => console.log("Video 1 play error:", e));
    });
  }
});

// --- TRAILER MODAL OPEN & CLOSE CONTROLLER ---
document.addEventListener("DOMContentLoaded", () => {
  const watchBtn = document.getElementById("watch-trailer-btn");
  const modal = document.getElementById("trailer-modal");
  const closeBtn = document.getElementById("trailer-close-btn");
  const backdrop = document.getElementById("trailer-modal-close");
  const v1 = document.getElementById("hero-video-1");
  const v2 = document.getElementById("hero-video-2");

  function openTrailer() {
    if (modal) modal.classList.add("open");
    if (v1) {
      v1.currentTime = 0;
      v1.classList.add("active");
      if (v2) v2.classList.remove("active");
      v1.play().catch(e => console.log(e));
    }
  }

  function closeTrailer() {
    if (modal) modal.classList.remove("open");
    if (v1) v1.pause();
    if (v2) v2.pause();
  }

  watchBtn && watchBtn.addEventListener("click", openTrailer);
  closeBtn && closeBtn.addEventListener("click", closeTrailer);
  backdrop && backdrop.addEventListener("click", closeTrailer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTrailer();
  });
});

// --- SECTION VIDEO DUAL LOOP CONTROLLER ---
document.addEventListener("DOMContentLoaded", () => {
  const sv1 = document.getElementById("section-video-1");
  const sv2 = document.getElementById("section-video-2");

  if (sv1 && sv2) {
    sv1.load();
    sv2.load();

    sv1.addEventListener("ended", () => {
      sv2.currentTime = 0;
      sv2.play().then(() => {
        sv2.classList.add("active");
        sv1.classList.remove("active");
      }).catch(e => console.log("Video 2 play error:", e));
    });

    sv2.addEventListener("ended", () => {
      sv1.currentTime = 0;
      sv1.play().then(() => {
        sv1.classList.add("active");
        sv2.classList.remove("active");
      }).catch(e => console.log("Video 1 play error:", e));
    });
  }
});



