document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // -------------------------
  // Register GSAP plugins
  // -------------------------
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

  // -------------------------
  // Section scroll assist (nudge to nearest .screen on wheel)
  // -------------------------
  (() => {
    if (prefersReducedMotion) return;

    const sections = Array.from(document.querySelectorAll("section.screen"));
    if (!sections.length || !window.ScrollToPlugin) return;

    let isSnapping = false;
    let snapTimeout = null;
    let wheelAccum = 0;
    const THRESHOLD = 80; // accumulated delta needed to trigger a snap

    function getTargetSection(dir) {
      const viewMid = window.scrollY + window.innerHeight / 2;
      let current = sections.reduce((best, s) => {
        const mid = s.offsetTop + s.offsetHeight / 2;
        return Math.abs(mid - viewMid) < Math.abs(best.offsetTop + best.offsetHeight / 2 - viewMid) ? s : best;
      }, sections[0]);

      const idx = sections.indexOf(current);
      const next = sections[idx + dir];
      return next || null;
    }

    window.addEventListener(
      "wheel",
      (e) => {
        if (isSnapping) {
          e.preventDefault();
          return;
        }

        const dir = e.deltaY > 0 ? 1 : -1;
        const atTop = window.scrollY <= 4;
        const atBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 4;
        if (dir === -1 && atTop) return;
        if (dir === 1 && atBottom) return;

        // Accumulate signed delta; reset if direction reverses
        if (Math.sign(e.deltaY) !== Math.sign(wheelAccum)) wheelAccum = 0;
        wheelAccum += e.deltaY;

        if (Math.abs(wheelAccum) < THRESHOLD) return; // let small flicks scroll freely
        wheelAccum = 0;

        const target = getTargetSection(dir);
        if (!target) return;

        e.preventDefault();
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
  })();

  (() => {
    if (prefersReducedMotion) return;
    if (!window.ScrollTrigger) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#about",
        start: "top 80%",
        once: true
      }
    });

    tl.from(".about-title", { y: 40, opacity: 0, duration: 0.7, ease: "power2.out" })
      .from(".about-lead", { y: 30, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.4")
      .from(".fact-card", { y: 50, opacity: 0, duration: 0.6, ease: "power2.out", stagger: 0.15 }, "-=0.3");
  })();

  // -------------------------
  // What You'll Learn scroll animation
  // -------------------------
  (() => {
    if (prefersReducedMotion) return;
    if (!window.ScrollTrigger) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#learn",
        start: "top 80%",
        once: true
      }
    });

    tl.from("#learn h2", { y: 40, opacity: 0, duration: 0.7, ease: "power2.out" })
      .from("#learn p", { y: 25, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.4")
      .from(".learnList", { y: 40, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
      .from(".preview", { x: 40, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.4");
  })();

  // -------------------------
  // Back to Top smooth scroll
  // -------------------------
  document.addEventListener("click", (e) => {
    const link = e.target.closest(".footer-top-link");
    if (!link) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

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
      themeSwitch.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      themeSwitch.setAttribute("title", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
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
      {
        n: 1,
        title: "What is a Network?",
        preview: "Define networks, devices, links, and what it means to move data between endpoints.",
        meta: ["Estimated: 10–15 min", "Includes: overview", "Ends with: quiz"]
      },
      {
        n: 2,
        title: "OSI & TCP/IP",
        preview: "Understand the OSI model as a mental map and how it relates to the real TCP/IP stack.",
        meta: ["Estimated: 15–20 min", "Includes: layers", "Ends with: quiz"]
      },
      {
        n: 3,
        title: "IP Addresses",
        preview:
          "Learn IP addressing fundamentals, subnet masks conceptually, and why addressing matters in real networks.",
        meta: ["Estimated: 15–25 min", "Includes: diagrams", "Ends with: quiz"]
      },
      {
        n: 4,
        title: "Switching & Routing",
        preview: "Learn what switches and routers do, and how traffic moves at Layer 2 vs Layer 3.",
        meta: ["Estimated: 20–30 min", "Includes: examples", "Ends with: quiz"]
      },
      {
        n: 5,
        title: "Core Protocols",
        preview: "Learn the big ones: DHCP, DNS, ARP, ICMP, and how they work together.",
        meta: ["Estimated: 20–30 min", "Includes: reference", "Ends with: quiz"]
      },
      {
        n: 6,
        title: "Security Basics",
        preview: "Learn foundational security ideas like segmentation, least privilege, and common network controls.",
        meta: ["Estimated: 15–25 min", "Includes: best practices", "Ends with: quiz"]
      }
    ];

    const previewTitle = document.getElementById("previewTitle");
    const previewBody = document.getElementById("previewBody");
    const previewMeta = document.getElementById("previewMeta");

    function setActive(idx) {
      document.querySelectorAll(".learnRow").forEach((r, i) => {
        r.classList.toggle("active", i === idx);
        r.setAttribute("aria-pressed", i === idx ? "true" : "false");
      });
      const ch = chapters[idx];
      if (previewTitle) previewTitle.textContent = ch.title;
      if (previewBody) previewBody.textContent = ch.preview;
      if (previewMeta) previewMeta.innerHTML = ch.meta.map((m) => `<span class="pill">${m}</span>`).join("");
    }

    chapters.forEach((c, idx) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "learnRow" + (c.n === 3 ? " active" : "");
      row.setAttribute("aria-pressed", c.n === 3 ? "true" : "false");
      row.innerHTML = `
        <div class="num">${c.n}</div>
        <div class="topic">${c.title}</div>
      `;
      row.addEventListener("click", () => setActive(idx));
      learnList.appendChild(row);
    });

    setActive(2);
  })();

  // -------------------------
  // "Begin" buttons (safe, only once)
  // -------------------------
  (() => {
    const go = () => {
      window.location.href = "lessons.html?id=chapter-1";
    };

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

    if (prefersReducedMotion) {
      track.style.transform = "translateX(0)";
      return;
    }

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
        repeat: -1
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
  // Site nav toggle (home/glossary mobile drawer)
  // -------------------------
  (() => {
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
      if (nav.classList.contains("is-open")) closeNav();
      else openNav();
    });

    overlay?.addEventListener("click", closeNav);
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });

    mobileMq.addEventListener("change", closeNav);
  })();

  // -------------------------
  // Navbar scroll detection (works for both packet_prep.html and lessons.html)
  // -------------------------
  (() => {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    // Solid-nav pages (e.g. glossary) never get the scroll-triggered styles
    const isSolid = topbar.classList.contains("topbar--solid");

    const hero = document.querySelector("#home.screen");
    const triggerHeight = hero ? hero.offsetHeight - 80 : 300; // fallback to 300px for lessons page

    let lastY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
      const y = window.scrollY;
      const delta = y - lastY;

      // Toggle "scrolled" state based on hero height or fixed threshold
      if (!isSolid) {
        if (y > triggerHeight) {
          topbar.classList.add("scrolled");
        } else {
          topbar.classList.remove("scrolled");
        }
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

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateNavbar);
          ticking = true;
        }
      },
      { passive: true }
    );

    // Set initial state
    updateNavbar();
  })();

  // -------------------------
  // Sidebar toggle (show/hide inline sidebar on desktop, drawer on mobile)
  // -------------------------
  (() => {
    const menuBtn = document.getElementById("menuBtn");
    const overlay = document.getElementById("overlay");
    const page = document.querySelector(".page");
    const sidebar = document.getElementById("sidebar");
    const mobileMq = window.matchMedia("(max-width: 860px)");
    if (!menuBtn || !page || !sidebar) return;

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
      const isOpen = isMobileView()
        ? sidebar.classList.contains("is-open")
        : !page.classList.contains("sidebar-closed");

      if (isOpen) closeSidebar();
      else openSidebar();
    });

    // overlay click closes
    if (overlay) overlay.addEventListener("click", closeSidebar);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });

    // ensure close buttons also close (some markup uses inline onclick)
    document.addEventListener("click", (e) => {
      const close = e.target.closest(".sidebar__close");
      if (close) closeSidebar();
    });

    mobileMq.addEventListener("change", () => {
      sidebar.classList.remove("is-open");
      if (overlay) overlay.setAttribute("hidden", "");
      document.body.classList.remove("nav-open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  })();

  // -------------------------
  // Hero particle network (dots + connecting lines)
  // -------------------------
  (() => {
    const hero = document.getElementById("home");
    if (!hero) return;
    if (prefersReducedMotion || window.matchMedia("(max-width: 860px)").matches) return;

    // Create and insert canvas behind hero content
    const canvas = document.createElement("canvas");
    canvas.className = "hero-canvas";
    canvas.setAttribute("aria-hidden", "true");
    hero.insertBefore(canvas, hero.firstChild);
    const ctx = canvas.getContext("2d");

    const PARTICLE_COUNT = 60;
    const MAX_DIST = 130; // max px between connected nodes
    const MOUSE_DIST = 160; // cursor connects to slightly farther nodes
    const SPEED = 0.4;

    let W, H;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      W = canvas.width = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }
    resize();
    new ResizeObserver(resize).observe(hero);

    // Build particles
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED * 2,
      vy: (Math.random() - 0.5) * SPEED * 2,
      r: 2 + Math.random() * 2
    }));

    function drawLine(x1, y1, x2, y2, alpha) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(255,156,182,${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);

      // Move particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }

      // Draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x,
            dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            drawLine(a.x, a.y, b.x, b.y, 1 - dist / MAX_DIST);
          }
        }

        // Lines from particle to mouse
        const mx = a.x - mouse.x,
          my = a.y - mouse.y;
        const md = Math.sqrt(mx * mx + my * my);
        if (md < MOUSE_DIST) {
          drawLine(a.x, a.y, mouse.x, mouse.y, (1 - md / MOUSE_DIST) * 0.8);
        }
      }

      // Draw dots
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,156,182,0.75)";
        ctx.fill();
      }

      requestAnimationFrame(loop);
    }

    loop();

    document.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        mouse.x = x;
        mouse.y = y;
      } else {
        mouse.x = -9999;
        mouse.y = -9999;
      }
    });
  })();
});
