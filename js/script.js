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
  // Navbar scroll detection (works for both packet_prep.html and lessons.html)
  // -------------------------
  (() => {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    const hero = document.querySelector("#home.screen");
    const triggerHeight = hero ? hero.offsetHeight - 80 : 300; // fallback to 300px for lessons page

    let lastY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
      const y = window.scrollY;
      const delta = y - lastY;

      // Toggle "scrolled" state based on hero height or fixed threshold
      if (y > triggerHeight) {
        topbar.classList.add("scrolled");
      } else {
        topbar.classList.remove("scrolled");
      }

      // Hide on scroll down, show on scroll up (but always show at top)
      if (y < 10) {
        topbar.classList.remove("hide");
      } else if (delta > 0) {
        topbar.classList.add("hide");
      } else if (delta < 0) {
        topbar.classList.remove("hide");
      }

      lastY = y;
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    }, { passive: true });

    // Set initial state
    updateNavbar();
  })();
});