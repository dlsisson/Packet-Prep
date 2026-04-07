// Lesson page loader and quiz logic.
let LESSONS = null;
const LESSON_PROGRESS_KEY = "packetprep.lessonProgress.v1";
const QUIZ_PASS_PERCENT = 70;
const CHAPTER_TIME_ESTIMATES = {
  1: "Estimated: 10-15 min",
  2: "Estimated: 15-20 min",
  3: "Estimated: 15-25 min",
  4: "Estimated: 20-30 min",
  5: "Estimated: 20-30 min",
  6: "Estimated: 15-25 min"
};

function getProgressState() {
  try {
    const raw = localStorage.getItem(LESSON_PROGRESS_KEY);
    if (!raw) return { chapters: {} };

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { chapters: {} };
    if (!parsed.chapters || typeof parsed.chapters !== "object") parsed.chapters = {};
    return parsed;
  } catch {
    return { chapters: {} };
  }
}

function saveProgressState(state) {
  try {
    localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(state));
  } catch {
    // Keep the page usable even if storage is blocked.
  }
}

function resetProgressState() {
  try {
    localStorage.removeItem(LESSON_PROGRESS_KEY);
  } catch {
    // Keep the page usable even if storage is blocked.
  }
}

function getChapterProgress(chapterId) {
  const state = getProgressState();
  return state.chapters[chapterId] || null;
}

function setChapterProgress(chapterId, score, total) {
  if (!chapterId || !total) return;

  const state = getProgressState();
  const percent = Math.round((score / total) * 100);
  const didPass = percent >= QUIZ_PASS_PERCENT;
  const existing = state.chapters[chapterId] || {};
  const bestPercent = Math.max(existing.bestPercent || 0, percent);

  state.chapters[chapterId] = {
    passed: didPass || Boolean(existing.passed),
    bestPercent,
    lastPercent: percent,
    attempts: (existing.attempts || 0) + 1,
    updatedAt: Date.now()
  };

  saveProgressState(state);
}

function updateCourseProgressUI(chapters) {
  const fillEl = document.getElementById("courseProgressFill");
  const textEl = document.getElementById("courseProgressText");
  if (!fillEl && !textEl) return;

  const state = getProgressState();
  const total = chapters.length || 0;
  const passedCount = chapters.filter((ch) => state.chapters[ch.id]?.passed).length;
  const percent = total ? Math.round((passedCount / total) * 100) : 0;

  if (fillEl) fillEl.style.width = `${percent}%`;
  if (textEl) textEl.textContent = `${percent}% (${passedCount}/${total})`;
}

function chapterCompleteIcon() {
  return `
    <span class="chapter-check" aria-label="Completed" title="Completed">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20 7 10 17l-6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    </span>
  `;
}

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

// Render each section by its content type.
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
    const items = (sec.items || [])
      .map(
        (item) => `
      <div class="twocol__row">
        <div class="twocol__left">
          <div class="twocol__badge">${item.label ?? ""}</div>
          <div class="twocol__title">${item.title ?? ""}</div>
        </div>

        <div class="twocol__right">
          <p class="twocol__desc">${item.desc ?? ""}</p>
        </div>
      </div>
    `
      )
      .join("");

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

  // Show a fallback message for unknown section types.
  return `
    <section class="section" id="${sec.id}">
      <h2>${sec.heading}</h2>
      <p class="muted">Unsupported section type: <span class="mono">${type}</span></p>
    </section>
  `;
}

function renderChapter(chapter, chapters) {
  // Keep the user's current sidebar state.

  // Title and subtitle.
  const titleEl = document.getElementById("chapterTitle");
  const subEl = document.getElementById("chapterSubtitle");
  const timeEl = document.getElementById("chapterTimeEstimate");
  if (titleEl) titleEl.textContent = chapter.title || "";
  if (subEl) subEl.textContent = chapter.subtitle || "";
  if (timeEl) {
    const fallbackEstimate = "Estimated: 10-15 min";
    timeEl.textContent = CHAPTER_TIME_ESTIMATES[chapter.number] || fallbackEstimate;
  }

  // Sidebar chapter label.
  const chapterLabel = document.getElementById("chapterLabel");
  if (chapterLabel) {
    chapterLabel.textContent = chapter.title || "Loading...";
  }

  // Chapter count.
  const chapterCountEl = document.getElementById("chapterCount");
  if (chapterCountEl) {
    const totalChapters = chapters.length;
    const currentNumber = chapter.number || 1;
    chapterCountEl.textContent = `${currentNumber} of ${totalChapters}`;
  }

  // Main section content.
  const sectionsMount = document.getElementById("lessonSections");
  if (sectionsMount) {
    sectionsMount.innerHTML = (chapter.sections || []).map(renderSectionHTML).join("");
  }

  // Sidebar navigation and chapter jump list.
  const sidebarNav = document.getElementById("sidebarNav");
  if (sidebarNav) {
    const state = getProgressState();

    sidebarNav.innerHTML = "";

    const currentGroup = document.createElement("div");
    currentGroup.className = "navgroup";

    const links = (chapter.sections || [])
      .map((sec) => `<a class="navitem" href="#${sec.id}" data-scroll>${sec.heading}</a>`)
      .join("");

    currentGroup.innerHTML = `
      ${links}
      <a class="navitem" href="#knowledge-check" data-scroll>Knowledge Check</a>
      <hr style="border:0;border-top:1px solid var(--border);margin:10px 12px">
      <div style="padding:12px 12px 10px" class="muted">Other Chapters</div>
      <ul class="jump-chapters-list">
        ${chapters
          .map(
            (ch) => `
          <li>
            <a class="navitem ${ch.id === chapter.id ? "is-active" : ""}"
               href="?id=${ch.id}"
               data-chapter-link="${ch.id}">
              <span class="chapter-link__label">Chapter ${ch.number}: ${ch.title}</span>
              ${state.chapters[ch.id]?.passed ? chapterCompleteIcon() : ""}
            </a>
          </li>
        `
          )
          .join("")}
      </ul>
      <div class="sidebar-reset-wrap">
        <button type="button" class="sidebar-reset-btn" data-reset-progress>Reset Progress</button>
      </div>
    `;

    sidebarNav.appendChild(currentGroup);
  }

  updateCourseProgressUI(chapters);

  // Previous and next chapter links.
  const idx = chapters.findIndex((c) => c.id === chapter.id);
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

  // Quiz mount point.
  const quizMount = document.getElementById("quizMount");
  if (quizMount) {
    quizMount.innerHTML = "";
    mountSingleCardQuiz(quizMount, chapter.quiz || [], chapter.id);
  }
}

// Intercept chapter links so navigation stays in-page.
function wireNavigation() {
  document.addEventListener("click", async (e) => {
    const backToTopLink = e.target.closest(".lesson-footer__top");
    if (backToTopLink) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const resetProgressBtn = e.target.closest("[data-reset-progress]");
    if (resetProgressBtn) {
      e.preventDefault();
      resetProgressState();
      await loadAndRender();
      return;
    }

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
  const chapter = chapters.find((c) => c.id === id) || chapters[0];

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

// Single-card multiple-choice quiz flow.
function mountSingleCardQuiz(mountEl, quizData, chapterId) {
  if (!quizData.length) {
    mountEl.innerHTML = `<div class="muted" style="padding:12px 0">No quiz for this chapter yet.</div>`;
    return;
  }

  let currentIndex = 0;
  let selectedIndex = null;
  let isLocked = false;
  let score = 0;
  let hasSavedCompletion = false;

  const total = quizData.length;

  function getCurrentQuestion() {
    return quizData[currentIndex];
  }

  function quizShell() {
    return `
      <section class="quizcard" id="knowledge-check" aria-live="polite">
        <div class="quizcard__top">
          <div class="quizcard__meta">
            <span id="quizProgressLabel">Question 1 of ${total}</span>
            <span id="quizScoreLabel">Score: 0/${total}</span>
          </div>
          <div class="quizcard__bar" aria-hidden="true">
            <div class="quizcard__fill" id="quizProgressFill"></div>
          </div>
        </div>

        <div class="quizcard__body" id="quizBody"></div>

        <div class="quizcard__actions">
          <button type="button" class="btn btn--primary" id="quizCheckBtn">Check Answer</button>
          <button type="button" class="btn" id="quizNextBtn" disabled>Next Question</button>
          <span class="quizcard__spacer"></span>
          <button type="button" class="btn btn--ghost" id="quizRestartBtn">Restart</button>
        </div>
      </section>
    `;
  }

  function renderQuestion() {
    const q = getCurrentQuestion();
    const bodyEl = mountEl.querySelector("#quizBody");
    const progressLabel = mountEl.querySelector("#quizProgressLabel");
    const scoreLabel = mountEl.querySelector("#quizScoreLabel");
    const progressFill = mountEl.querySelector("#quizProgressFill");
    const checkBtn = mountEl.querySelector("#quizCheckBtn");
    const nextBtn = mountEl.querySelector("#quizNextBtn");

    if (!q || !bodyEl) return;

    selectedIndex = null;
    isLocked = false;

    const progressPercent = (score / total) * 100;

    if (progressLabel) {
      progressLabel.textContent = `Question ${currentIndex + 1} of ${total}`;
    }

    if (scoreLabel) {
      scoreLabel.textContent = `Score: ${score}/${total}`;
    }

    if (progressFill) {
      progressFill.style.width = `${progressPercent}%`;
    }

    if (checkBtn) checkBtn.disabled = false;
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = currentIndex === total - 1 ? "View Results" : "Next Question";
    }

    const rawChoices = q.choices || [];
    // Shuffle choices and track the new index of the correct answer.
    const indices = rawChoices.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const shuffledChoices = indices.map((i) => rawChoices[i]);
    q._shuffledAnswerIndex = indices.indexOf(q.answerIndex);

    const options = shuffledChoices
      .map(
        (choice, idx) => `
      <label class="quizopt" data-option-index="${idx}">
        <input
          type="radio"
          name="quiz-${chapterId}-${currentIndex}"
          value="${idx}"
          aria-label="${choice}"
        />
        <span>${choice}</span>
      </label>
    `
      )
      .join("");

    bodyEl.innerHTML = `
      <h2 class="quizcard__prompt">${q.question}</h2>
      <div class="quizcard__options" id="quizOptions">${options}</div>
      <div class="quizcard__feedback" id="quizFeedback">Choose one option, then click Check Answer.</div>
    `;
  }

  function renderResults() {
    const bodyEl = mountEl.querySelector("#quizBody");
    const progressLabel = mountEl.querySelector("#quizProgressLabel");
    const scoreLabel = mountEl.querySelector("#quizScoreLabel");
    const progressFill = mountEl.querySelector("#quizProgressFill");
    const checkBtn = mountEl.querySelector("#quizCheckBtn");
    const nextBtn = mountEl.querySelector("#quizNextBtn");

    if (progressLabel) progressLabel.textContent = "Complete";
    if (scoreLabel) scoreLabel.textContent = `Final Score: ${score}/${total}`;
    if (progressFill) {
      const percent = Math.round((score / total) * 100);
      progressFill.style.width = `${percent}%`;
    }
    if (checkBtn) checkBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;

    const percent = Math.round((score / total) * 100);
    const didPass = percent >= QUIZ_PASS_PERCENT;

    persistCompletionIfNeeded();

    let summary = "Good effort. Review the chapter and try again for a higher score.";

    if (percent === 100) {
      summary = "Perfect score. You are ready for the next chapter.";
    } else if (percent >= 80) {
      summary = "Strong work. You have a solid understanding of this chapter.";
    } else if (percent >= 60) {
      summary = "Nice progress. A quick review will help lock in the concepts.";
    }

    const passLine = didPass
      ? `<p class="muted">Status: Passed (${percent}% >= ${QUIZ_PASS_PERCENT}%)</p>`
      : `<p class="muted">Status: Not passed yet (${percent}% < ${QUIZ_PASS_PERCENT}%).</p>`;

    if (bodyEl) {
      bodyEl.innerHTML = `
        <h2 class="quizcard__prompt">Knowledge Check Complete</h2>
        <p>You scored <strong>${score}/${total}</strong> (${percent}%).</p>
        ${passLine}
        <div class="quizcard__feedback is-correct">${summary}</div>
      `;
    }
  }

  function handleSelectionChange(e) {
    const input = e.target.closest("input[type='radio']");
    if (!input || isLocked) return;

    selectedIndex = Number(input.value);

    const labels = mountEl.querySelectorAll(".quizopt");
    labels.forEach((label) => label.classList.remove("is-selected"));
    input.closest(".quizopt")?.classList.add("is-selected");
  }

  function handleCheckAnswer() {
    if (isLocked) return;

    const q = getCurrentQuestion();
    const feedbackEl = mountEl.querySelector("#quizFeedback");
    const options = mountEl.querySelectorAll(".quizopt");
    const checkBtn = mountEl.querySelector("#quizCheckBtn");
    const nextBtn = mountEl.querySelector("#quizNextBtn");
    const scoreLabel = mountEl.querySelector("#quizScoreLabel");
    const progressFill = mountEl.querySelector("#quizProgressFill");

    if (selectedIndex === null) {
      if (feedbackEl) {
        feedbackEl.classList.remove("is-correct", "is-wrong");
        feedbackEl.textContent = "Select an answer before checking.";
      }
      return;
    }

    isLocked = true;
    const correctIdx = q._shuffledAnswerIndex ?? q.answerIndex;
    const isCorrect = selectedIndex === correctIdx;

    if (isCorrect) score += 1;

    options.forEach((label, idx) => {
      label.classList.remove("is-correct", "is-wrong");
      if (idx === correctIdx) label.classList.add("is-correct");
      if (idx === selectedIndex && idx !== correctIdx) label.classList.add("is-wrong");
    });

    const inputs = mountEl.querySelectorAll("input[type='radio']");
    inputs.forEach((input) => {
      input.disabled = true;
    });

    if (feedbackEl) {
      feedbackEl.classList.remove("is-correct", "is-wrong");
      feedbackEl.classList.add(isCorrect ? "is-correct" : "is-wrong");
      feedbackEl.textContent = isCorrect
        ? `Correct. ${q.explanation || "Great job."}`
        : `Not quite. ${q.explanation || "Review this concept and try again."}`;
    }

    if (scoreLabel) scoreLabel.textContent = `Score: ${score}/${total}`;
    if (progressFill) {
      const progressPercent = (score / total) * 100;
      progressFill.style.width = `${progressPercent}%`;
    }
    if (checkBtn) checkBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = false;

    if (currentIndex === total - 1) {
      persistCompletionIfNeeded();
    }
  }

  function handleNextQuestion() {
    if (!isLocked) return;

    if (currentIndex >= total - 1) {
      renderResults();
      return;
    }

    currentIndex += 1;
    renderQuestion();
  }

  function handleRestart() {
    currentIndex = 0;
    selectedIndex = null;
    isLocked = false;
    score = 0;
    hasSavedCompletion = false;
    renderQuestion();
  }

  function persistCompletionIfNeeded() {
    if (hasSavedCompletion) return;

    const percent = Math.round((score / total) * 100);
    const didPass = percent >= QUIZ_PASS_PERCENT;

    setChapterProgress(chapterId, score, total);

    if (LESSONS?.chapters) {
      updateCourseProgressUI(LESSONS.chapters);
    }

    const chapterLink = document.querySelector(`[data-chapter-link="${chapterId}"]`);
    if (didPass && chapterLink && !chapterLink.querySelector(".chapter-check")) {
      chapterLink.insertAdjacentHTML("beforeend", chapterCompleteIcon());
    }

    hasSavedCompletion = true;
  }

  mountEl.innerHTML = quizShell();

  const body = mountEl.querySelector("#quizBody");
  const checkBtn = mountEl.querySelector("#quizCheckBtn");
  const nextBtn = mountEl.querySelector("#quizNextBtn");
  const restartBtn = mountEl.querySelector("#quizRestartBtn");

  body?.addEventListener("change", handleSelectionChange);
  checkBtn?.addEventListener("click", handleCheckAnswer);
  nextBtn?.addEventListener("click", handleNextQuestion);
  restartBtn?.addEventListener("click", handleRestart);

  renderQuestion();
}
