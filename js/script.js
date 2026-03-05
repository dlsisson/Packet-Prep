document.addEventListener("DOMContentLoaded", () => {
  // -------------------------
  // Theme (safe)
  // -------------------------
  (() => {
    const themeSwitch = document.getElementById("themeSwitch");
    if (!themeSwitch) return;

    function applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("pp_theme", theme);
      themeSwitch.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
    }

    // Init
    const saved = localStorage.getItem("pp_theme");
    applyTheme(saved === "dark" ? "dark" : "light");

    // Toggle
    function toggleTheme() {
      const cur = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(cur === "dark" ? "light" : "dark");
    }

    themeSwitch.addEventListener("click", toggleTheme);
    themeSwitch.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleTheme();
      }
    });
  })();

  // -------------------------
  // Home page "Learn list" preview panel (only if #learnList exists)
  // -------------------------
  (() => {
    const learnList = document.getElementById("learnList");
    if (!learnList) return;

    const chapters = [
      { n: 1, title: "What is a Network?", preview: "Define networks, devices, links, and what it means to move data between endpoints.", meta:["Estimated: 10–15 min","Includes: overview","Ends with: quiz"] },
      { n: 2, title: "OSI & TCP/IP", preview: "Understand the OSI model as a mental map and how it relates to the real TCP/IP stack.", meta:["Estimated: 15–20 min","Includes: layers","Ends with: quiz"] },
      { n: 3, title: "IP Addresses", preview: "Learn IP addressing fundamentals, subnet masks conceptually, and why addressing matters in real networks.", meta:["Estimated: 15–25 min","Includes: diagrams","Ends with: quiz"] },
      { n: 4, title: "Switching & Routing", preview: "Learn what switches and routers do, and how traffic moves at Layer 2 vs Layer 3.", meta:["Estimated: 20–30 min","Includes: examples","Ends with: quiz"] },
      { n: 5, title: "Core Protocols", preview: "Learn the big ones: DHCP, DNS, ARP, ICMP, and how they work together.", meta:["Estimated: 20–30 min","Includes: reference","Ends with: quiz"] },
      { n: 6, title: "Security Basics", preview: "Learn foundational security ideas like segmentation, least privilege, and common network controls.", meta:["Estimated: 15–25 min","Includes: best practices","Ends with: quiz"] }
    ];

    const previewTitle = document.getElementById("previewTitle");
    const previewBody  = document.getElementById("previewBody");
    const previewMeta  = document.getElementById("previewMeta");

    function setActive(idx){
      document.querySelectorAll(".learnRow").forEach((r,i)=>{
        r.classList.toggle("active", i === idx);
      });
      const ch = chapters[idx];
      if (previewTitle) previewTitle.textContent = ch.title;
      if (previewBody) previewBody.textContent = ch.preview;
      if (previewMeta) previewMeta.innerHTML = ch.meta.map(m => `<span class="pill">${m}</span>`).join("");
    }

    chapters.forEach((c, idx)=>{
      const row = document.createElement("div");
      row.className = "learnRow" + (c.n === 3 ? " active" : "");
      row.innerHTML = `
        <div class="num">${c.n}</div>
        <div class="topic">${c.title}</div>
      `;
      row.addEventListener("click", ()=> setActive(idx));
      learnList.appendChild(row);
    });

    setActive(2);
  })();

  // -------------------------
  // "Begin" buttons (safe, only once)
  // -------------------------
  (() => {
    const go = () => { window.location.href = "lessons.html?id=chapter-1"; };

    document.getElementById("beginBtn")?.addEventListener("click", go);
    document.getElementById("beginBtn2")?.addEventListener("click", go);
  })();

  // -------------------------
  // Hero ticker (GSAP infinite right-to-left)
  // -------------------------
  (() => {
    const viewport = document.getElementById("heroTickerViewport");
    const track = document.getElementById("heroTickerTrack");
    if (!viewport || !track || typeof gsap === "undefined") return;

    const baseMarkup = track.innerHTML.trim();

    let tween;

    function buildTrack() {
      const measure = document.createElement("div");
      measure.className = "ticker-group";
      measure.style.position = "absolute";
      measure.style.visibility = "hidden";
      measure.style.pointerEvents = "none";
      measure.innerHTML = baseMarkup;
      viewport.appendChild(measure);

      const unitWidth = measure.offsetWidth;
      measure.remove();
      if (!unitWidth) return 0;

      const requiredGroups = Math.max(3, Math.ceil((viewport.offsetWidth * 2) / unitWidth) + 1);
      track.innerHTML = "";

      for (let i = 0; i < requiredGroups; i += 1) {
        const group = document.createElement("div");
        group.className = "ticker-group";
        group.innerHTML = baseMarkup;
        if (i > 0) group.setAttribute("aria-hidden", "true");
        track.appendChild(group);
      }

      return unitWidth;
    }

    function startTicker() {
      const groupWidth = buildTrack();
      if (!groupWidth) return;

      if (tween) tween.kill();

      const pixelsPerSecond = 10;
      const duration = groupWidth / pixelsPerSecond;

      gsap.set(track, { x: 0 });
      tween = gsap.to(track, {
        x: -groupWidth,
        duration,
        ease: "none",
        repeat: -1,
      });
    }

    startTicker();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(startTicker, 120);
    });
  })();

  // -------------------------
  // Packet page section snap (GSAP)
  // -------------------------
  (() => {
    const isPacketPage = !!document.getElementById("heroTickerViewport");
    if (!isPacketPage || typeof gsap === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const snapTargets = [
      ...document.querySelectorAll("section.screen, section.ticker-banner, footer.site-footer"),
    ];
    if (snapTargets.length < 2) return;

    let tween = null;
    let activeIndex = 0;
    let wheelAccumulator = 0;

    const WHEEL_TRIGGER = 24;

    function clampIndex(i) {
      return Math.max(0, Math.min(snapTargets.length - 1, i));
    }

    function nearestIndex() {
      const y = window.scrollY;
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      for (let i = 0; i < snapTargets.length; i += 1) {
        const dist = Math.abs(y - snapTargets[i].offsetTop);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }

      return bestIdx;
    }

    function goTo(index) {
      const next = clampIndex(index);
      const targetY = snapTargets[next].offsetTop;

      if (Math.abs(window.scrollY - targetY) < 2) {
        activeIndex = next;
        return;
      }

      if (tween) tween.kill();

      const state = { y: window.scrollY };
      tween = gsap.to(state, {
        y: targetY,
        duration: 0.62,
        ease: "power2.out",
        onStart: () => {
          document.body.classList.add("is-snap-scrolling");
        },
        onUpdate: () => window.scrollTo(0, state.y),
        onInterrupt: () => {
          document.body.classList.remove("is-snap-scrolling");
        },
        onComplete: () => {
          document.body.classList.remove("is-snap-scrolling");
          activeIndex = next;
          tween = null;
        },
      });
    }

    function onWheel(e) {
      e.preventDefault();

      const normalizedDelta =
        e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      wheelAccumulator += normalizedDelta;

      if (tween) return;

      if (Math.abs(wheelAccumulator) < WHEEL_TRIGGER) return;

      const direction = wheelAccumulator > 0 ? 1 : -1;
      wheelAccumulator = 0;

      activeIndex = nearestIndex();
      if (direction > 0) {
        goTo(activeIndex + 1);
      } else {
        goTo(activeIndex - 1);
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", () => {
      activeIndex = nearestIndex();
    });
  })();

  // -------------------------
  // Navbar scroll detection (works for both packet_prep.html and lessons.html)
  // -------------------------
  (() => {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    // Keep topbar style static; disable hero/scroll-driven nav style changes.
    topbar.classList.remove("scrolled");
    topbar.classList.remove("hide");
  })();
});