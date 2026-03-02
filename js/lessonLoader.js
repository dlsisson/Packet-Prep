// js/lessonLoader.js
let LESSONS = null;

async function getLessons() {
  if (LESSONS) return LESSONS;
  const res = await fetch("./data/lessons.json");
  if (!res.ok) throw new Error("Failed to load lessons.json");
  LESSONS = await res.json();
  return LESSONS;
}

function getChapterIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || "chapter-1"; // default
}

function setURLChapter(id) {
  const url = new URL(window.location.href);
  url.searchParams.set("id", id);
  history.pushState({ id }, "", url);
}

function renderChapter(chapter, chapters) {
  // --- title/subtitle ---
  document.getElementById("chapterTitle").textContent = chapter.title;
  document.getElementById("chapterSubtitle").textContent = chapter.subtitle || "";

  // --- sections ---
  const sectionsMount = document.getElementById("lessonSections");
  sectionsMount.innerHTML = ""; // wipe old chapter

  chapter.sections.forEach(sec => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "section";
    sectionEl.id = sec.id;

    sectionEl.innerHTML = `
      <h2>${sec.heading}</h2>
      ${sec.html}
    `;
    sectionsMount.appendChild(sectionEl);
  });

  // --- sidebar nav (chapter sections list) ---
  const sidebarNav = document.getElementById("sidebarNav");
  sidebarNav.innerHTML = ""; // wipe old nav

  const currentGroup = document.createElement("div");
  currentGroup.className = "navgroup"; // reuse your styles if you want

  // Build section anchors
  const links = chapter.sections.map(sec =>
    `<a class="navitem" href="#${sec.id}" data-scroll>${sec.heading}</a>`
  ).join("");

  currentGroup.innerHTML = `
    <div class="navgroup__title" style="padding:12px">
      <span>Chapter ${chapter.number}: ${chapter.title}</span>
    </div>
    ${links}
    <a class="navitem" href="#knowledge-check" data-scroll>Knowledge Check</a>
    <hr style="border:0;border-top:1px solid var(--border);margin:10px 12px">
    <div style="padding:0 12px 10px" class="muted">Jump Chapters</div>
    ${chapters.map(ch => `
      <a class="navitem ${ch.id === chapter.id ? "is-active" : ""}"
         href="?id=${ch.id}"
         data-chapter-link="${ch.id}">
        Chapter ${ch.number}: ${ch.title}
      </a>
    `).join("")}
  `;

  sidebarNav.appendChild(currentGroup);

  // --- prev/next ---
  const idx = chapters.findIndex(c => c.id === chapter.id);
  const prev = chapters[idx - 1] || null;
  const next = chapters[idx + 1] || null;

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (prev) {
    prevBtn.href = `?id=${prev.id}`;
    prevBtn.dataset.chapterLink = prev.id;
    prevBtn.classList.remove("is-disabled");
    prevBtn.removeAttribute("aria-disabled");
  } else {
    prevBtn.href = "#";
    prevBtn.classList.add("is-disabled");
    prevBtn.setAttribute("aria-disabled", "true");
  }

  if (next) {
    nextBtn.href = `?id=${next.id}`;
    nextBtn.dataset.chapterLink = next.id;
    nextBtn.classList.remove("is-disabled");
    nextBtn.removeAttribute("aria-disabled");
  } else {
    nextBtn.href = "#";
    nextBtn.classList.add("is-disabled");
    nextBtn.setAttribute("aria-disabled", "true");
  }

  // --- quiz mount (hook your single-card quiz here) ---
  const quizMount = document.getElementById("quizMount");
  quizMount.innerHTML = ""; // wipe old quiz UI
  mountSingleCardQuiz(quizMount, chapter.quiz || [], chapter.id);
}

// Event delegation: intercept chapter link clicks for SPA-like behavior
function wireNavigation() {
  document.addEventListener("click", async (e) => {
    const link = e.target.closest("[data-chapter-link]");
    if (!link) return;

    e.preventDefault();
    const id = link.dataset.chapterLink;
    setURLChapter(id);
    await loadAndRender();
    // optional: scroll to top of content
    document.getElementById("main")?.scrollIntoView({ behavior: "smooth" });
  });

  window.addEventListener("popstate", () => {
    loadAndRender(); // back/forward browser buttons
  });
}

async function loadAndRender() {
  const data = await getLessons();
  const chapters = data.chapters;
  const id = getChapterIdFromURL();
  const chapter = chapters.find(c => c.id === id) || chapters[0];
  renderChapter(chapter, chapters);
}

document.addEventListener("DOMContentLoaded", async () => {
  wireNavigation();
  await loadAndRender();
});


// ---------------------------------------------------------
// Quiz: mount your single-card quiz per chapter
// (This is a minimal stub; replace with your full single-card logic)
// ---------------------------------------------------------
function mountSingleCardQuiz(mountEl, quizData, chapterId) {
  // If no quiz provided, show a friendly message
  if (!quizData.length) {
    mountEl.innerHTML = `<div class="muted" style="padding:12px 0">No quiz for this chapter yet.</div>`;
    return;
  }

  // Example: reuse your single-card component function
  // For now, just show that it loaded the right quiz:
  mountEl.innerHTML = `
    <section class="quiz" id="knowledge-check">
      <h2>Knowledge Check</h2>
      <p class="muted">Loaded ${quizData.length} questions for ${chapterId}.</p>
      <!-- Call your real single-card quiz renderer here -->
    </section>
  `;
}