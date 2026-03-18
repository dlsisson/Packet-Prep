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
  return params.get("id") || "chapter-1";
}

function setURLChapter(id) {
  const url = new URL(window.location.href);
  url.searchParams.set("id", id);
  history.pushState({ id }, "", url);
}

// -------- Section rendering (supports types) --------
function renderSectionHTML(sec) {
  const type = sec.type || "richtext";

  if (type === "richtext") {
    return `
      <section class="section" id="${sec.id}">
        <h2>${sec.heading}</h2>
        ${sec.html || ""}
      </section>
    `;
  }

  if (type === "twoColList") {
    const items = (sec.items || []).map(item => `
      <div class="twocol__row">
        <div class="twocol__left">
          <div class="twocol__badge">${item.label ?? ""}</div>
          <div class="twocol__title">${item.title ?? ""}</div>
        </div>

        <div class="twocol__right">
          <p class="twocol__desc">${item.desc ?? ""}</p>
        </div>
      </div>
    `).join("");

    return `
      <section class="section" id="${sec.id}">
        <h2>${sec.heading}</h2>
        ${sec.introHtml || ""}
        <div class="twocol">
          ${items}
        </div>
      </section>
    `;
  }

  // Fallback: show something instead of silently failing
  return `
    <section class="section" id="${sec.id}">
      <h2>${sec.heading}</h2>
      <p class="muted">Unsupported section type: <span class="mono">${type}</span></p>
    </section>
  `;
}

function renderChapter(chapter, chapters) {
  // NOTE: don't force the sidebar open here; keep user's last state.

  // --- title/subtitle ---
  const titleEl = document.getElementById("chapterTitle");
  const subEl = document.getElementById("chapterSubtitle");
  if (titleEl) titleEl.textContent = chapter.title || "";
  if (subEl) subEl.textContent = chapter.subtitle || "";

  // --- update sidebar chapter label ---
  const chapterLabel = document.getElementById("chapterLabel");
  if (chapterLabel) {
    chapterLabel.textContent = chapter.title || "Loading...";
  }

  // --- chapter count display ---
  const chapterCountEl = document.getElementById("chapterCount");
  if (chapterCountEl) {
    const totalChapters = chapters.length;
    const currentNumber = chapter.number || 1;
    chapterCountEl.textContent = `${currentNumber} of ${totalChapters}`;
  }

  // --- sections ---
  const sectionsMount = document.getElementById("lessonSections");
  if (sectionsMount) {
    sectionsMount.innerHTML = (chapter.sections || []).map(renderSectionHTML).join("");
  }

  // --- sidebar nav (chapter sections + jump chapters) ---
  const sidebarNav = document.getElementById("sidebarNav");
  if (sidebarNav) {
    sidebarNav.innerHTML = "";

    const currentGroup = document.createElement("div");
    currentGroup.className = "navgroup";

    const links = (chapter.sections || []).map(sec =>
      `<a class="navitem" href="#${sec.id}" data-scroll>${sec.heading}</a>`
    ).join("");

    currentGroup.innerHTML = `
      ${links}
      <a class="navitem" href="#knowledge-check" data-scroll>Knowledge Check</a>
      <hr style="border:0;border-top:1px solid var(--border);margin:10px 12px">
      <div style="padding:12px 12px 10px" class="muted">Other Chapters</div>
      <ul class="jump-chapters-list">
        ${chapters.map(ch => `
          <li>
            <a class="navitem ${ch.id === chapter.id ? "is-active" : ""}"
               href="?id=${ch.id}"
               data-chapter-link="${ch.id}">
              Chapter ${ch.number}: ${ch.title}
            </a>
          </li>
        `).join("")}
      </ul>
    `;

    sidebarNav.appendChild(currentGroup);
  }

  // --- prev/next ---
  const idx = chapters.findIndex(c => c.id === chapter.id);
  const prev = chapters[idx - 1] || null;
  const next = chapters[idx + 1] || null;

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (prevBtn) {
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
  }

  if (nextBtn) {
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
  }

  // --- quiz mount ---
  const quizMount = document.getElementById("quizMount");
  if (quizMount) {
    quizMount.innerHTML = "";
    mountSingleCardQuiz(quizMount, chapter.quiz || [], chapter.id);
  }
}

// Event delegation: intercept chapter link clicks for SPA-like behavior
function wireNavigation() {
  document.addEventListener("click", async (e) => {
    const link = e.target.closest("[data-chapter-link]");
    if (!link) return;

    e.preventDefault();
    const id = link.dataset.chapterLink;
    if (!id) return;

    setURLChapter(id);
    await loadAndRender();
    document.getElementById("main")?.scrollIntoView({ behavior: "smooth" });
  });

  window.addEventListener("popstate", () => {
    loadAndRender();
  });
}

async function loadAndRender() {
  const data = await getLessons();
  const chapters = data.chapters || [];
  const id = getChapterIdFromURL();
  const chapter = chapters.find(c => c.id === id) || chapters[0];

  if (!chapter) {
    console.warn("No chapters found in lessons.json");
    return;
  }

  renderChapter(chapter, chapters);
}

document.addEventListener("DOMContentLoaded", async () => {
  wireNavigation();
  await loadAndRender();
});

// ---------------------------------------------------------
// Quiz: mount your single-card quiz per chapter (stub)
// ---------------------------------------------------------
function mountSingleCardQuiz(mountEl, quizData, chapterId) {
  if (!quizData.length) {
    mountEl.innerHTML = `<div class="muted" style="padding:12px 0">No quiz for this chapter yet.</div>`;
    return;
  }

  mountEl.innerHTML = `
    <section class="quiz" id="knowledge-check">
      <h2>Knowledge Check</h2>
      <p class="muted">Loaded ${quizData.length} questions for ${chapterId}.</p>
    </section>
  `;
}