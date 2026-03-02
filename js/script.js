    // Dark mode toggle
    const themeSwitch = document.getElementById("themeSwitch");
    function setTheme(t){
      document.documentElement.setAttribute("data-theme", t);
      localStorage.setItem("pp_theme", t);
      themeSwitch.setAttribute("aria-checked", t === "dark" ? "true" : "false");
    }
    setTheme(localStorage.getItem("pp_theme") || "light");

    function toggleTheme(){
      const cur = document.documentElement.getAttribute("data-theme") || "light";
      setTheme(cur === "dark" ? "light" : "dark");
    }
    themeSwitch.addEventListener("click", toggleTheme);
    themeSwitch.addEventListener("keydown", (e)=>{
      if(e.key === "Enter" || e.key === " "){ e.preventDefault(); toggleTheme(); }
    });

    // Desktop learn list + preview panel
    const chapters = [
      { n: 1, title: "What is a Network?", preview: "Define networks, devices, links, and what it means to move data between endpoints.", meta:["Estimated: 10–15 min","Includes: overview","Ends with: quiz"] },
      { n: 2, title: "OSI & TCP/IP", preview: "Understand the OSI model as a mental map and how it relates to the real TCP/IP stack.", meta:["Estimated: 15–20 min","Includes: layers","Ends with: quiz"] },
      { n: 3, title: "IP Addresses", preview: "Learn IP addressing fundamentals, subnet masks conceptually, and why addressing matters in real networks.", meta:["Estimated: 15–25 min","Includes: diagrams","Ends with: quiz"] },
      { n: 4, title: "Switching & Routing", preview: "Learn what switches and routers do, and how traffic moves at Layer 2 vs Layer 3.", meta:["Estimated: 20–30 min","Includes: examples","Ends with: quiz"] },
      { n: 5, title: "Core Protocols", preview: "Learn the big ones: DHCP, DNS, ARP, ICMP, and how they work together.", meta:["Estimated: 20–30 min","Includes: reference","Ends with: quiz"] },
      { n: 6, title: "Security Basics", preview: "Learn foundational security ideas like segmentation, least privilege, and common network controls.", meta:["Estimated: 15–25 min","Includes: best practices","Ends with: quiz"] }
    ];

    const learnList = document.getElementById("learnList");
    const previewTitle = document.getElementById("previewTitle");
    const previewBody = document.getElementById("previewBody");
    const previewMeta = document.getElementById("previewMeta");

    function setActive(idx){
      document.querySelectorAll(".learnRow").forEach((r,i)=>{
        r.classList.toggle("active", i === idx);
      });
      const ch = chapters[idx];
      previewTitle.textContent = ch.title;
      previewBody.textContent = ch.preview;
      previewMeta.innerHTML = ch.meta.map(m => `<span class="pill">${m}</span>`).join("");
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

    // default highlight #3 (matches your wireframe)
    setActive(2);

    // Begin buttons: placeholder behavior (you’ll route to course page later)
    document.getElementById("beginBtn").addEventListener("click", ()=> {
      document.getElementById("about").scrollIntoView({ behavior:"smooth" });
    });
    document.getElementById("beginBtn2").addEventListener("click", ()=> {
      // start at “What You'll Learn” screen for a more desktop-LMS feel
      document.querySelector(".learnHeader").scrollIntoView({ behavior:"smooth" });
    });

// ==========================
// NAVBAR: HIDE ON DOWN, SHOW ON UP (NO SPUTTER)
// ==========================
const navbar = document.querySelector(".topbar");
const hero = document.querySelector(".hero");

let lastY = window.scrollY;
let lastActionTime = 0;
let ticking = false;

const heroHeight = hero ? hero.offsetHeight : 200;

// Tune these
const TOP_LOCK_PX = 6;      // always show when within 0-6px from top
const SHOW_AT_TOP_PX = 40;  // always show when within first 40px (prevents early hide)
const DEADZONE = 10;        // ignore small scroll jitter
const COOLDOWN_MS = 180;    // min time between hide/show changes

function setHidden(hidden) {
  navbar.classList.toggle("hide", hidden);
}

function updateNavbar() {
  const y = window.scrollY;
  const delta = y - lastY;
  const now = performance.now();

  // 1) Visual state (shadow/shrink)
  navbar.classList.toggle("scrolled", y > 10);

  // 2) Hard lock at the very top (kills sputter)
  if (y <= TOP_LOCK_PX) {
    setHidden(false);
    lastY = y;
    ticking = false;
    return;
  }

  // 3) Always show near top / hero area (prevents immediate hide)
  if (y <= Math.min(heroHeight + 40, SHOW_AT_TOP_PX)) {
    setHidden(false);
    lastY = y;
    ticking = false;
    return;
  }

  // 4) Ignore micro movement
  if (Math.abs(delta) < DEADZONE) {
    lastY = y;
    ticking = false;
    return;
  }

  // 5) Cooldown to prevent rapid toggling
  if (now - lastActionTime < COOLDOWN_MS) {
    lastY = y;
    ticking = false;
    return;
  }

  // 6) Direction logic
  if (delta > 0) {
    // scrolling down
    setHidden(true);
  } else {
    // scrolling up
    setHidden(false);
  }

  lastActionTime = now;
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

  const page = document.querySelector(".page");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.getElementById("menuBtn");
  const collapseBtn = document.querySelector(".sidebar__toggle");

  const isMobile = () => window.matchMedia("(max-width: 860px)").matches;

  function openMobileNav() {
    sidebar.classList.add("is-open");
    overlay.hidden = false;
    document.body.classList.add("nav-open");
    menuBtn.setAttribute("aria-expanded", "true");
  }

  function closeMobileNav() {
    sidebar.classList.remove("is-open");
    overlay.hidden = true;
    document.body.classList.remove("nav-open");
    menuBtn.setAttribute("aria-expanded", "false");
  }

  // Hamburger toggles mobile drawer
  menuBtn?.addEventListener("click", () => {
    if (!isMobile()) return; // desktop ignores hamburger
    sidebar.classList.contains("is-open") ? closeMobileNav() : openMobileNav();
  });

  // Desktop collapse toggle
  collapseBtn?.addEventListener("click", () => {
    if (isMobile()) {
      // on mobile, collapse button acts like "close"
      closeMobileNav();
      return;
    }
    page.classList.toggle("is-collapsed");
  });

  // Overlay click closes mobile drawer
  overlay?.addEventListener("click", closeMobileNav);

  // ESC closes mobile drawer
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMobile()) closeMobileNav();
  });

  // If resizing from mobile->desktop, clean up classes
  window.addEventListener("resize", () => {
    if (!isMobile()) {
      closeMobileNav();
    }
  });


  //button to start lesson 1
    document.getElementById("beginBtn").addEventListener("click", function () {
    window.location.href = "lesson.html?id=chapter-1";
  });

  // ===== Single-card quiz engine =====
// You can later replace this array with JSON-loaded data for each chapter.
const QUIZ = [
  {
    topic: "IP Addressing",
    question: "What layer does IP addressing primarily operate at?",
    options: ["Layer 1", "Layer 2", "Layer 3", "Layer 7"],
    answerIndex: 2,
    explain: "IP is Layer 3 (Network layer) and is used for routing between networks."
  },
  {
    topic: "IPv4",
    question: "How many bits are in an IPv4 address?",
    options: ["16", "32", "48", "128"],
    answerIndex: 1,
    explain: "IPv4 is 32 bits, usually shown as four octets."
  },
  {
    topic: "CIDR",
    question: "What does /24 mean?",
    options: ["24 hosts", "24 networks", "24-bit network prefix", "24-bit host portion"],
    answerIndex: 2,
    explain: "/24 means the first 24 bits are the network prefix."
  },
  {
    topic: "Subnetting",
    question: "What is the main purpose of subnetting?",
    options: ["Increase cable speed", "Split a network into smaller networks", "Convert IPv4 to IPv6", "Disable routing"],
    answerIndex: 1,
    explain: "Subnetting splits networks for efficiency, design, and broadcast control."
  },
  {
    topic: "Private Ranges",
    question: "Which is a common private IPv4 range?",
    options: ["8.8.8.0/24", "172.16.0.0/12", "1.1.1.0/24", "100.64.0.0/10"],
    answerIndex: 1,
    explain: "172.16.0.0–172.31.255.255 is private (RFC1918)."
  }
];

(function initSingleCardQuiz(){
  const qCounter  = document.getElementById("qCounter");
  const qTopic    = document.getElementById("qTopic");
  const qFill     = document.getElementById("qFill");
  const qPrompt   = document.getElementById("qPrompt");
  const qForm     = document.getElementById("qForm");
  const qFeedback = document.getElementById("qFeedback");
  const qAction   = document.getElementById("qAction");
  const qRestart  = document.getElementById("qRestart");

  if (!qCounter || !qForm || !qAction) return; // page might not have quiz

  let index = 0;
  let score = 0;
  let phase = "answer"; // "answer" | "review" | "done"
  let selected = null;

  function setFeedback(type, text){
    qFeedback.classList.remove("is-correct", "is-wrong");
    if (type) qFeedback.classList.add(type);
    qFeedback.textContent = text || "";
  }

  function render(){
    const total = QUIZ.length;
    const q = QUIZ[index];

    // Progress
    qCounter.textContent = `Question ${index + 1} / ${total}`;
    qTopic.textContent = q.topic || "";
    qFill.style.width = `${(index / total) * 100}%`;

    // Prompt
    qPrompt.textContent = q.question;

    // Options
    qForm.innerHTML = "";
    selected = null;

    q.options.forEach((optText, i) => {
      const id = `q_${index}_opt_${i}`;
      const label = document.createElement("label");
      label.className = "quizopt";
      label.setAttribute("for", id);

      label.innerHTML = `
        <input id="${id}" type="radio" name="quizopt" value="${i}">
        <span>${optText}</span>
      `;
      qForm.appendChild(label);
    });

    // Reset UI state
    phase = "answer";
    setFeedback(null, "Pick an answer, then click “Check Answer”.");
    qAction.textContent = "Check Answer";
    qAction.disabled = true;

    qRestart.hidden = true;
  }

  function renderDone(){
    phase = "done";
    qFill.style.width = "100%";
    qForm.innerHTML = "";
    qPrompt.textContent = "Quiz Complete";

    const pct = Math.round((score / QUIZ.length) * 100);
    setFeedback(null, `Final Score: ${score}/${QUIZ.length} (${pct}%)`);

    qAction.textContent = "Continue";
    qAction.disabled = false;

    qRestart.hidden = false;
  }

  // Enable button once a choice is made
  qForm.addEventListener("change", (e) => {
    const input = e.target.closest('input[type="radio"]');
    if (!input) return;
    selected = Number(input.value);
    if (phase === "answer") qAction.disabled = false;
  });

  qAction.addEventListener("click", () => {
    if (phase === "answer") {
      if (selected === null) return;

      const q = QUIZ[index];
      const correct = selected === q.answerIndex;

      if (correct) {
        score++;
        setFeedback("is-correct", `✅ Correct. ${q.explain || ""}`);
      } else {
        const correctText = q.options[q.answerIndex];
        setFeedback("is-wrong", `❌ Not quite. Correct answer: “${correctText}”. ${q.explain || ""}`);
      }

      phase = "review";
      qAction.textContent = (index === QUIZ.length - 1) ? "Finish" : "Next Question";
      qAction.disabled = false; // keep enabled
      return;
    }

    if (phase === "review") {
      if (index === QUIZ.length - 1) {
        renderDone();
      } else {
        index++;
        render();
      }
      return;
    }

    if (phase === "done") {
      // Optional: redirect to next chapter, gate it, etc.
      // Example: window.location.href = "lesson.html?id=chapter-4";
      // For now just scroll down / do nothing.
      document.getElementById("knowledge-check")?.scrollIntoView({ behavior: "smooth" });
    }
  });

  qRestart.addEventListener("click", () => {
    index = 0;
    score = 0;
    render();
  });

  render();
})();