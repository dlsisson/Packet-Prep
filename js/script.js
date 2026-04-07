document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  registerGsapPlugins();
  setupWheelSnap(prefersReducedMotion);
  setupAboutAnimation(prefersReducedMotion);
  setupLearnAnimation(prefersReducedMotion);
  setupBackToTop(prefersReducedMotion);
  setupThemeToggle();
  setupLearnPreviewPanel();
  setupBeginButtons();
  setupHeroTicker(prefersReducedMotion);
  setupSiteNavDrawer();
  setupNavbarScroll();
  setupLessonSidebar();
  setupHeroParticles(prefersReducedMotion);
});

function registerGsapPlugins() {
  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (window.ScrollToPlugin) {
    gsap.registerPlugin(ScrollToPlugin);
  }
}

function setupWheelSnap(prefersReducedMotion) {
  if (prefersReducedMotion) return;
  if (window.matchMedia("(max-width: 860px)").matches) return;
  if (!window.ScrollToPlugin) return;

  const sections = Array.from(document.querySelectorAll("section.screen"));
  if (sections.length === 0) return;

  let isSnapping = false;
  let wheelAccum = 0;
  let snapTimeout = null;
  const THRESHOLD = 80;

  function getClosestSection() {
    const viewMiddle = window.scrollY + window.innerHeight / 2;
    let closest = sections[0];
    let smallestDistance = Infinity;

    for (const section of sections) {
      const sectionMiddle = section.offsetTop + section.offsetHeight / 2;
      const distance = Math.abs(sectionMiddle - viewMiddle);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closest = section;
      }
    }

    return closest;
  }

  function getTargetSection(direction) {
    const current = getClosestSection();
    const currentIndex = sections.indexOf(current);
    return sections[currentIndex + direction] || null;
  }

  window.addEventListener(
    "wheel",
    (event) => {
      if (isSnapping) {
        event.preventDefault();
        return;
      }

      const direction = event.deltaY > 0 ? 1 : -1;
      const atTop = window.scrollY <= 4;
      const atBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 4;

      if (direction === -1 && atTop) return;
      if (direction === 1 && atBottom) return;

      if (Math.sign(event.deltaY) !== Math.sign(wheelAccum)) {
        wheelAccum = 0;
      }

      wheelAccum += event.deltaY;
      if (Math.abs(wheelAccum) < THRESHOLD) return;
      wheelAccum = 0;

      const target = getTargetSection(direction);
      if (!target) return;

      event.preventDefault();
      isSnapping = true;

      gsap.to(window, {
        scrollTo: { y: target, offsetY: 0 },
        duration: 0.65,
        ease: "power2.inOut",
        onComplete: () => {
          clearTimeout(snapTimeout);
          snapTimeout = setTimeout(() => {
            isSnapping = false;
          }, 150);
        }
      });
    },
    { passive: false }
  );
}

function setupAboutAnimation(prefersReducedMotion) {
  if (prefersReducedMotion) return;
  if (!window.ScrollTrigger) return;

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#about",
      start: "top 80%",
      once: true
    }
  });

  timeline
    .from(".about-title", { y: 40, opacity: 0, duration: 0.7, ease: "power2.out" })
    .from(".about-lead", { y: 30, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.4")
    .from(".fact-card", { y: 50, opacity: 0, duration: 0.6, ease: "power2.out", stagger: 0.15 }, "-=0.3");
}

function setupLearnAnimation(prefersReducedMotion) {
  if (prefersReducedMotion) return;
  if (!window.ScrollTrigger) return;

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#learn",
      start: "top 80%",
      once: true
    }
  });

  timeline
    .from("#learn h2", { y: 40, opacity: 0, duration: 0.7, ease: "power2.out" })
    .from("#learn p", { y: 25, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.4")
    .from(".learnList", { y: 40, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
    .from(".preview", { x: 40, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.4");
}

function setupBackToTop(prefersReducedMotion) {
  document.addEventListener("click", (event) => {
    const backToTopLink = event.target.closest(".footer-top-link");
    if (!backToTopLink) return;

    event.preventDefault();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
}

function setupThemeToggle() {
  const themeSwitch = document.getElementById("themeSwitch");
  if (!themeSwitch) return;

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pp_theme", theme);
    themeSwitch.setAttribute("aria-checked", isDark ? "true" : "false");
    themeSwitch.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    themeSwitch.setAttribute("title", isDark ? "Switch to light theme" : "Switch to dark theme");
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  }

  const savedTheme = localStorage.getItem("pp_theme");
  applyTheme(savedTheme === "dark" ? "dark" : "light");

  themeSwitch.addEventListener("click", toggleTheme);
  themeSwitch.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleTheme();
    }
  });
}

function setupLearnPreviewPanel() {
  const learnList = document.getElementById("learnList");
  if (!learnList) return;

  const chapters = [
    {
      n: 1,
      title: "What is a Network?",
      preview: "Define networks, devices, links, and what it means to move data between endpoints.",
      meta: ["Estimated: 10–15 min"]
    },
    {
      n: 2,
      title: "OSI & TCP/IP",
      preview: "Understand the OSI model as a mental map and how it relates to the real TCP/IP stack.",
      meta: ["Estimated: 15–20 min"]
    },
    {
      n: 3,
      title: "IP Addresses",
      preview:
        "Learn IP addressing fundamentals, subnet masks conceptually, and why addressing matters in real networks.",
      meta: ["Estimated: 15–25 min"]
    },
    {
      n: 4,
      title: "Switching & Routing",
      preview: "Learn what switches and routers do, and how traffic moves at Layer 2 vs Layer 3.",
      meta: ["Estimated: 20–30 min"]
    },
    {
      n: 5,
      title: "Core Protocols",
      preview: "Learn the big ones: DHCP, DNS, ARP, ICMP, and how they work together.",
      meta: ["Estimated: 20–30 min"]
    },
    {
      n: 6,
      title: "Security Basics",
      preview: "Learn foundational security ideas like segmentation, least privilege, and common network controls.",
      meta: ["Estimated: 15–25 min"]
    }
  ];

  const previewTitle = document.getElementById("previewTitle");
  const previewBody = document.getElementById("previewBody");
  const previewMeta = document.getElementById("previewMeta");

  function setActive(index) {
    const rows = document.querySelectorAll(".learnRow");
    rows.forEach((row, rowIndex) => {
      const isActive = rowIndex === index;
      row.classList.toggle("active", isActive);
      row.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    const chapter = chapters[index];
    if (previewTitle) previewTitle.textContent = chapter.title;
    if (previewBody) previewBody.textContent = chapter.preview;

    if (previewMeta) {
      const pills = chapter.meta.map((item) => `<span class="pill">${item}</span>`);
      previewMeta.innerHTML = pills.join("");
    }
  }

  chapters.forEach((chapter, index) => {
    const row = document.createElement("button");
    const isDefault = chapter.n === 3;

    row.type = "button";
    row.className = isDefault ? "learnRow active" : "learnRow";
    row.setAttribute("aria-pressed", isDefault ? "true" : "false");
    row.innerHTML = `
      <div class="num">${chapter.n}</div>
      <div class="topic">${chapter.title}</div>
    `;

    row.addEventListener("click", () => {
      setActive(index);
    });

    learnList.appendChild(row);
  });

  setActive(2);
}

function setupBeginButtons() {
  function goToFirstChapter() {
    window.location.href = "lessons.html?id=chapter-1";
  }

  const beginBtn = document.getElementById("beginBtn");
  if (beginBtn) beginBtn.addEventListener("click", goToFirstChapter);

  const beginBtn2 = document.getElementById("beginBtn2");
  if (beginBtn2) beginBtn2.addEventListener("click", goToFirstChapter);
}

function setupHeroTicker(prefersReducedMotion) {
  const viewport = document.getElementById("heroTickerViewport");
  const track = document.getElementById("heroTickerTrack");
  if (!viewport || !track) return;
  if (typeof gsap === "undefined") return;

  if (prefersReducedMotion) {
    track.style.transform = "translateX(0)";
    return;
  }

  const baseMarkup = track.innerHTML.trim();
  let tickerTween = null;

  function buildTrack() {
    const measure = document.createElement("div");
    measure.className = "ticker-group";
    measure.style.position = "absolute";
    measure.style.visibility = "hidden";
    measure.style.pointerEvents = "none";
    measure.innerHTML = baseMarkup;
    viewport.appendChild(measure);

    const groupWidth = measure.offsetWidth;
    measure.remove();
    if (!groupWidth) return 0;

    const groupsNeeded = Math.max(3, Math.ceil((viewport.offsetWidth * 2) / groupWidth) + 1);
    track.innerHTML = "";

    for (let i = 0; i < groupsNeeded; i++) {
      const group = document.createElement("div");
      group.className = "ticker-group";
      group.innerHTML = baseMarkup;
      if (i > 0) group.setAttribute("aria-hidden", "true");
      track.appendChild(group);
    }

    return groupWidth;
  }

  function startTicker() {
    const groupWidth = buildTrack();
    if (!groupWidth) return;

    if (tickerTween) {
      tickerTween.kill();
    }

    const pixelsPerSecond = 10;
    const duration = groupWidth / pixelsPerSecond;

    gsap.set(track, { x: 0 });
    tickerTween = gsap.to(track, {
      x: -groupWidth,
      duration,
      ease: "none",
      repeat: -1
    });
  }

  startTicker();

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(startTicker, 120);
  });
}

function setupSiteNavDrawer() {
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.querySelector(".site-nav");
  const overlay = document.getElementById("overlay");
  if (!menuBtn || !nav) return;

  const mobileMq = window.matchMedia("(max-width: 860px)");

  function closeNav() {
    nav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    if (overlay) overlay.setAttribute("hidden", "");
    document.body.classList.remove("nav-open");
  }

  function openNav() {
    if (!mobileMq.matches) return;
    nav.classList.add("is-open");
    menuBtn.setAttribute("aria-expanded", "true");
    if (overlay) overlay.removeAttribute("hidden");
    document.body.classList.add("nav-open");
  }

  menuBtn.addEventListener("click", () => {
    if (!mobileMq.matches) return;

    const isOpen = nav.classList.contains("is-open");
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  });

  if (overlay) {
    overlay.addEventListener("click", closeNav);
  }

  nav.addEventListener("click", (event) => {
    const clickedLink = event.target.closest("a");
    if (clickedLink) {
      closeNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });

  mobileMq.addEventListener("change", closeNav);
}

function setupNavbarScroll() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;

  const isSolid = topbar.classList.contains("topbar--solid");
  const hero = document.querySelector("#home.screen");
  const triggerHeight = hero ? hero.offsetHeight - 80 : 300;

  let lastY = window.scrollY;
  let ticking = false;

  function updateNavbar() {
    const currentY = window.scrollY;
    const delta = currentY - lastY;

    if (!isSolid) {
      if (currentY > triggerHeight) {
        topbar.classList.add("scrolled");
      } else {
        topbar.classList.remove("scrolled");
      }
    }

    if (currentY < 10) {
      topbar.classList.remove("hide");
    } else if (delta > 0) {
      topbar.classList.add("hide");
    } else if (delta < 0) {
      topbar.classList.remove("hide");
    }

    lastY = currentY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      requestAnimationFrame(updateNavbar);
      ticking = true;
    },
    { passive: true }
  );

  updateNavbar();
}

function setupLessonSidebar() {
  const menuBtn = document.getElementById("menuBtn");
  const overlay = document.getElementById("overlay");
  const page = document.querySelector(".page");
  const sidebar = document.getElementById("sidebar");
  if (!menuBtn || !page || !sidebar) return;

  const mobileMq = window.matchMedia("(max-width: 860px)");

  function isMobileView() {
    return mobileMq.matches;
  }

  function closeSidebar() {
    if (isMobileView()) {
      sidebar.classList.remove("is-open");
    } else {
      page.classList.add("sidebar-closed");
    }

    menuBtn.setAttribute("aria-expanded", "false");
    if (overlay) overlay.setAttribute("hidden", "");
    document.body.classList.remove("nav-open");
  }

  function openSidebar() {
    if (isMobileView()) {
      sidebar.classList.add("is-open");
    } else {
      page.classList.remove("sidebar-closed");
    }

    menuBtn.setAttribute("aria-expanded", "true");
    if (overlay) overlay.removeAttribute("hidden");
    document.body.classList.add("nav-open");
  }

  menuBtn.addEventListener("click", () => {
    const isOpen = isMobileView() ? sidebar.classList.contains("is-open") : !page.classList.contains("sidebar-closed");

    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSidebar();
    }
  });

  document.addEventListener("click", (event) => {
    const closeBtn = event.target.closest(".sidebar__close");
    if (closeBtn) {
      closeSidebar();
    }
  });

  mobileMq.addEventListener("change", () => {
    sidebar.classList.remove("is-open");
    if (overlay) overlay.setAttribute("hidden", "");
    document.body.classList.remove("nav-open");
    menuBtn.setAttribute("aria-expanded", "false");
  });
}

function setupHeroParticles(prefersReducedMotion) {
  const hero = document.getElementById("home");
  if (!hero) return;
  if (prefersReducedMotion) return;
  if (window.matchMedia("(max-width: 860px)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const PARTICLE_COUNT = 60;
  const MAX_DIST = 130;
  const MOUSE_DIST = 160;
  const SPEED = 0.4;

  let width = 0;
  let height = 0;
  const mouse = { x: -9999, y: -9999 };

  function resizeCanvas() {
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }

  resizeCanvas();
  new ResizeObserver(resizeCanvas).observe(hero);

  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * SPEED * 2,
      vy: (Math.random() - 0.5) * SPEED * 2,
      r: 2 + Math.random() * 2
    });
  }

  function drawLine(x1, y1, x2, y2, alpha) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `rgba(255,156,182,${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;
    }

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];

      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MAX_DIST) {
          drawLine(a.x, a.y, b.x, b.y, 1 - distance / MAX_DIST);
        }
      }

      const mouseDx = a.x - mouse.x;
      const mouseDy = a.y - mouse.y;
      const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

      if (mouseDistance < MOUSE_DIST) {
        drawLine(a.x, a.y, mouse.x, mouse.y, (1 - mouseDistance / MOUSE_DIST) * 0.8);
      }
    }

    for (const particle of particles) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,156,182,0.75)";
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  animate();

  document.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const insideHero = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
    if (insideHero) {
      mouse.x = x;
      mouse.y = y;
    } else {
      mouse.x = -9999;
      mouse.y = -9999;
    }
  });
}
