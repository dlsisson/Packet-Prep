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
// NAVBAR SCROLL BEHAVIOR
// ==========================

const navbar = document.querySelector(".topbar");
const hero = document.querySelector(".hero");

let lastScrollY = window.scrollY;
let ticking = false;

// Height of hero (prevents hiding while at top)
const heroHeight = hero ? hero.offsetHeight : 200;

function updateNavbar() {
  const currentScrollY = window.scrollY;

  // Add shadow + shrink when not at top
  if (currentScrollY > 10) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }

  // Hide when scrolling down (after hero)
  if (currentScrollY > lastScrollY && currentScrollY > heroHeight) {
    navbar.classList.add("hide");
  } else {
    navbar.classList.remove("hide");
  }

  lastScrollY = currentScrollY;
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(updateNavbar);
    ticking = true;
  }
});