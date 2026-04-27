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

  function updateBrandLogos(theme) {
    // Light theme uses light variants; dark theme keeps the bright logos for contrast.
    const navLogoPath = theme === "light" ? "Assets/Images/Logo/nav-icon-light.png" : "Assets/Images/Logo/nav-icon.png";
    const footerLogoPath = theme === "light" ? "Assets/Images/Logo/Logo-dark-light.png" : "Assets/Images/Logo/Logo.png";

    document.querySelectorAll(".logo-nav img").forEach((logo) => {
      logo.setAttribute("src", navLogoPath);
    });

    document.querySelectorAll(".footer-logo img").forEach((logo) => {
      logo.setAttribute("src", footerLogoPath);
    });
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pp_theme", theme);
    updateBrandLogos(theme);

    if (!themeSwitch) return;
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

  if (!themeSwitch) return;

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
      meta: ["Estimated: 10–15 min"],
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
        <g>
          <path d="M247.467,84.122v14.012c0,4.71,3.823,8.533,8.533,8.533s8.533-3.823,8.533-8.533V84.122c14.677-3.814,25.6-17.067,25.6-32.922c0-18.825-15.309-34.133-34.133-34.133S221.867,32.375,221.867,51.2C221.867,67.055,232.789,80.307,247.467,84.122z M256,34.133c9.404,0,17.067,7.654,17.067,17.067c0,9.412-7.663,17.067-17.067,17.067c-9.412,0-17.067-7.654-17.067-17.067C238.933,41.788,246.588,34.133,256,34.133z"/>
          <path d="M89.694,225.545c1.707-4.395-0.469-9.336-4.864-11.042l-16.879-6.562c0.094-1.05,0.316-2.065,0.316-3.14c0-18.825-15.317-34.133-34.133-34.133C15.309,170.667,0,185.975,0,204.8s15.309,34.133,34.133,34.133c11.674,0,21.99-5.905,28.151-14.882l16.367,6.357c1.015,0.393,2.057,0.58,3.089,0.58C85.154,230.989,88.38,228.924,89.694,225.545z M34.133,221.867c-9.412,0-17.067-7.654-17.067-17.067s7.654-17.067,17.067-17.067c9.412,0,17.067,7.654,17.067,17.067S43.546,221.867,34.133,221.867z"/>
          <path d="M392.533,426.667c-4.77,0-9.301,0.998-13.423,2.765l-14.191-16.802c-3.038-3.601-8.422-4.07-12.023-1.015c-3.61,3.038-4.053,8.422-1.024,12.023l13.798,16.35c-4.489,5.777-7.27,12.945-7.27,20.813c0,18.825,15.309,34.133,34.133,34.133c18.825,0,34.133-15.309,34.133-34.133C426.667,441.975,411.358,426.667,392.533,426.667z M392.533,477.867c-9.412,0-17.067-7.654-17.067-17.067c0-9.412,7.654-17.067,17.067-17.067c9.404,0,17.067,7.654,17.067,17.067C409.6,470.212,401.937,477.867,392.533,477.867z"/>
          <path d="M477.867,170.667c-18.825,0-34.133,15.309-34.133,34.133c0,1.067,0.213,2.082,0.316,3.132l-16.367,6.323c-4.403,1.707-6.588,6.647-4.881,11.042c1.306,3.379,4.531,5.461,7.953,5.461c1.024,0,2.065-0.188,3.081-0.58l15.872-6.144c6.153,8.986,16.469,14.899,28.16,14.899c18.825,0,34.133-15.309,34.133-34.133S496.691,170.667,477.867,170.667z M477.867,221.867c-9.412,0-17.067-7.654-17.067-17.067s7.654-17.067,17.067-17.067c9.404,0,17.067,7.654,17.067,17.067S487.27,221.867,477.867,221.867z"/>
          <path d="M402.543,319.078c0.008-0.026,0.017-0.043,0.026-0.06c4.557-14.515,7.031-29.952,7.031-45.952s-2.475-31.437-7.031-45.952c-0.008-0.017-0.017-0.034-0.026-0.06C382.942,164.779,324.668,119.467,256,119.467c-68.676,0-126.95,45.312-146.551,107.597l-0.009,0.043c-4.565,14.515-7.04,29.952-7.04,45.96s2.475,31.445,7.04,45.961l0.009,0.043c19.601,62.276,77.867,107.588,146.526,107.597h0.008h0.009H256h0.009h0.009C324.685,426.658,382.942,381.355,402.543,319.078z M229.513,139.162c-17.058,16.606-39.672,44.348-51.277,82.705h-48.717C146.603,179.814,184.004,148.147,229.513,139.162z M119.467,273.067c0-11.802,1.664-23.202,4.489-34.133h50.005c-2.099,10.684-3.294,22.059-3.294,34.133c0,12.075,1.195,23.45,3.294,34.133h-50.005C121.131,296.269,119.467,284.868,119.467,273.067z M129.519,324.267h48.717c11.605,38.357,34.219,66.099,51.277,82.705C184.004,397.986,146.603,366.319,129.519,324.267z M247.467,400.213c-14.857-13.44-38.374-39.245-51.021-75.947h51.021V400.213z M247.467,307.2h-55.885c-2.372-10.65-3.849-21.99-3.849-34.133s1.476-23.484,3.849-34.133h55.885V307.2z M247.467,221.867h-51.021c12.646-36.702,36.164-62.507,51.021-75.947V221.867z M392.533,273.067c0,11.802-1.672,23.202-4.497,34.133h-49.997c2.091-10.684,3.294-22.059,3.294-34.133c0-12.075-1.203-23.45-3.294-34.133h49.997C390.861,249.865,392.533,261.265,392.533,273.067z M382.481,221.867h-48.717c-11.605-38.357-34.227-66.099-51.285-82.705C327.996,148.147,365.389,179.814,382.481,221.867z M264.533,145.92c14.857,13.44,38.374,39.245,51.012,75.947h-51.012V145.92z M264.533,238.933h55.885c2.372,10.65,3.849,21.99,3.849,34.133s-1.476,23.484-3.849,34.133h-55.885V238.933z M264.533,400.213v-75.947h51.012C302.908,360.969,279.39,386.773,264.533,400.213z M282.479,406.972c17.058-16.606,39.68-44.348,51.285-82.705h48.717C365.397,366.319,327.996,397.986,282.479,406.972z"/>
          <path d="M159.454,410.889c-3.558-3.089-8.951-2.714-12.032,0.853l-15.164,17.459c-3.959-1.604-8.26-2.534-12.791-2.534c-18.825,0-34.133,15.309-34.133,34.133c0,18.825,15.309,34.133,34.133,34.133c18.816,0,34.133-15.309,34.133-34.133c0-8.098-2.953-15.445-7.68-21.299l14.387-16.572C163.396,419.371,163.021,413.978,159.454,410.889z M119.467,477.867c-9.412,0-17.067-7.654-17.067-17.067c0-9.412,7.654-17.067,17.067-17.067s17.067,7.654,17.067,17.067C136.533,470.212,128.879,477.867,119.467,477.867z"/>
        </g>
      </svg>`
    },
    {
      n: 2,
      title: "OSI & TCP/IP",
      preview: "Understand the OSI model as a mental map and how it relates to the real TCP/IP stack.",
      meta: ["Estimated: 15–20 min"],
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" fill="currentColor" aria-hidden="true">
        <path d="M53.952,54.694l-2.885-9C50.935,45.281,50.55,45,50.115,45H48v-6c0-0.553-0.447-1-1-1h-1v-6c0-0.553-0.447-1-1-1h-1v-6c0-0.553-0.447-1-1-1h-1v-6c0-0.553-0.447-1-1-1h-1v-6c0-0.553-0.447-1-1-1h-1V5c0-0.553-0.447-1-1-1h-4.556l-0.112-3.037C32.313,0.426,31.871,0,31.333,0h-6.666c-0.538,0-0.979,0.426-0.999,0.963L23.556,4H19c-0.553,0-1,0.447-1,1v5h-1c-0.553,0-1,0.447-1,1v6h-1c-0.553,0-1,0.447-1,1v6h-1c-0.553,0-1,0.447-1,1v6h-1c-0.553,0-1,0.447-1,1v6H9c-0.553,0-1,0.447-1,1v6H5.885c-0.435,0-0.819,0.281-0.952,0.694l-2.885,9c-0.098,0.305-0.044,0.637,0.145,0.896C2.381,55.848,2.681,56,3,56h50c0.319,0,0.619-0.152,0.808-0.41C53.996,55.331,54.05,54.999,53.952,54.694z M24.223,40h7.553l0.185,5h-7.924L24.223,40z M30.74,12l0.185,5h-5.85l0.185-5H30.74z M25.335,10l0.148-4h5.035l0.148,4H25.335z M30.999,19l0.185,5h-6.368l0.185-5H30.999z M31.258,26l0.185,5h-6.887l0.185-5H31.258z M31.517,33l0.185,5h-7.405l0.185-5H31.517z M33.963,45l-0.185-5H45h1v5H33.963z M33.704,38l-0.185-5H43h1v5H33.704z M33.445,31l-0.185-5H41h1v5H33.445z M33.185,24L33,19h6h1v5H33.185z M32.926,17l-0.185-5H37h1v5H32.926z M36,6v4h-3.333l-0.148-4H36z M25.631,2h4.738l0.074,2h-4.886L25.631,2z M20,6h3.481l-0.148,4H20V6z M18,12h1h4.259l-0.185,5H18V12z M16,19h1h6l-0.185,5H16V19z M14,26h1h7.74l-0.185,5H14V26z M12,33h1h9.481l-0.185,5H12V33z M10,40h1h11.222l-0.185,5H10V40z M4.371,54l2.243-7H9h14h10h14h2.386l2.243,7H4.371z"/>
      </svg>`
    },
    {
      n: 3,
      title: "IP Addresses",
      preview:
        "Learn IP addressing fundamentals, subnet masks conceptually, and why addressing matters in real networks.",
      meta: ["Estimated: 15–25 min"],
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
        <!-- Top monitor body -->
        <rect x="32" y="4" width="36" height="26" rx="2"/>
        <rect x="38" y="7" width="24" height="18" fill="var(--bg,#fff)" rx="1"/>
        <rect x="46" y="30" width="8" height="5"/>
        <rect x="40" y="35" width="20" height="3" rx="1"/>
        <!-- Vertical line top monitor to bus -->
        <rect x="49" y="38" width="2" height="10"/>
        <!-- Horizontal bus -->
        <rect x="10" y="47" width="80" height="4" rx="1"/>
        <!-- Port bumps -->
        <rect x="24" y="44" width="8" height="10" rx="1"/>
        <rect x="68" y="44" width="8" height="10" rx="1"/>
        <!-- Vertical lines bus to bottom monitors -->
        <rect x="27" y="57" width="2" height="8"/>
        <rect x="71" y="57" width="2" height="8"/>
        <!-- Bottom-left monitor body -->
        <rect x="8" y="65" width="34" height="24" rx="2"/>
        <rect x="12" y="68" width="26" height="16" fill="var(--bg,#fff)" rx="1"/>
        <rect x="21" y="89" width="8" height="4"/>
        <rect x="16" y="93" width="18" height="3" rx="1"/>
        <!-- Bottom-right monitor body -->
        <rect x="58" y="65" width="34" height="24" rx="2"/>
        <rect x="62" y="68" width="26" height="16" fill="var(--bg,#fff)" rx="1"/>
        <rect x="71" y="89" width="8" height="4"/>
        <rect x="66" y="93" width="18" height="3" rx="1"/>
      </svg>`
    },
    {
      n: 4,
      title: "Switching & Routing",
      preview: "Learn what switches and routers do, and how traffic moves at Layer 2 vs Layer 3.",
      meta: ["Estimated: 20–30 min"],
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="16 3 21 3 21 8"/>
        <line x1="4" y1="20" x2="21" y2="3"/>
        <polyline points="21 16 21 21 16 21"/>
        <line x1="15" y1="15" x2="21" y2="21"/>
        <line x1="4" y1="4" x2="9" y2="9"/>
      </svg>`
    },
    {
      n: 5,
      title: "Core Protocols",
      preview: "Learn the big ones: DHCP, DNS, ARP, ICMP, and how they work together.",
      meta: ["Estimated: 20–30 min"],
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <line x1="8" y1="9" x2="16" y2="9"/>
        <line x1="8" y1="13" x2="13" y2="13"/>
      </svg>`
    },
    {
      n: 6,
      title: "Security Basics",
      preview: "Learn foundational security ideas like segmentation, least privilege, and common network controls.",
      meta: ["Estimated: 15–25 min"],
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>`
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
    const previewIcon = document.getElementById("previewIcon");
    if (previewIcon) previewIcon.innerHTML = chapter.svg;
    if (previewTitle) previewTitle.textContent = chapter.title;
    if (previewBody) previewBody.textContent = chapter.preview;

    if (previewMeta) {
      const pills = chapter.meta.map((item) => `<span class="pill">${item}</span>`);
      previewMeta.innerHTML = pills.join("");
    }
  }

  chapters.forEach((chapter, index) => {
    const row = document.createElement("button");
    const isDefault = chapter.n === 1;

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

  setActive(0);
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
