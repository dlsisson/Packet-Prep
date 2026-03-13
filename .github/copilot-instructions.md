# Packet Prep — Copilot Instructions

## Project Overview

**Packet Prep** is a single-page, beginner-friendly learning platform for networking fundamentals. It combines a hero landing page, instructional content structure, and a dark mode toggle into a responsive design using vanilla HTML, CSS, and JavaScript—no frameworks.

**Key Goal:** Present 6 networking chapters (OSI model, IP addressing, routing, protocols, security) with smooth navigation, preview panels, and theme persistence.

---

## Architecture & Data Flow

### Single-Page Structure

- **`packet_prep.html`**: Six full-viewport sections (`min-height: calc(100vh - var(--topH))`), each self-contained with semantic HTML
- **Navigation pattern**: Hash-based anchors (`#home`, `#about`, `#progress`, etc.) for smooth scrolling
- **Critical constraint**: Top bar (`var(--topH): 52px`) is sticky and hides on scroll-down after the hero section

### Data & State Management

- **Chapter data** is hardcoded in `script.js` as a `chapters` array with: `n` (number), `title`, `preview` (description), `meta` (tags)
- **Theme persistence**: Uses `localStorage.getItem/setItem("pp_theme")` with `[data-theme]` CSS attribute
- **Active chapter**: Tracked via `.active` class on `.learnRow` elements; preview panel updates via `.textContent` and `.innerHTML`

### Component Interaction

1. **Learn List** (`#learnList`): Dynamically generated from `chapters` array; click handler calls `setActive(idx)`
2. **Preview Panel** (`.preview`): Updates `#previewTitle`, `#previewBody`, `#previewMeta` when `setActive()` is called
3. **Default state**: Chapter 3 (IP Addresses) is active on load via `setActive(2)` (0-indexed)

---

## Visual & Interaction Patterns

### CSS Variables (Root & Dark Theme)

**Light mode defaults:**

```css
--bg: #fff; /* page background */
--text: #111; /* primary text */
--muted: #666; /* secondary text */
--line: #cfcfcf; /* borders */
--panel: #f2f2f2; /* card/button backgrounds */
```

**Dark mode** (`[data-theme="dark"]`): Overrides all variables to match GitHub-dark palette.

- **All interactive elements** must respect these CSS variables for theme compatibility
- **No hardcoded colors**—use `var(--name)` exclusively

### Navbar Behavior

- **Sticky positioning** with scroll-triggered hide/show via `updateNavbar()` function
- **Hide logic**: `currentScrollY > heroHeight && scrollingDown` → add `.hide` class → `transform: translateY(-100%)`
- **Show logic**: Scrolling up or at top removes `.hide`
- **Shrink effect**: When scrolled past top 10px, add `.scrolled` class for shadow and height reduction (52px → 44px)

### Button & Interactive States

- All `.btn` elements have `border` + `background: var(--btn)`, no fill-only styles
- Hover states rely on CSS `:hover` (no JS event listeners on buttons except Begin buttons which scroll to sections)

---

## File Responsibilities

| File                 | Purpose                                                  | Key Patterns                                                                                                  |
| -------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **packet_prep.html** | Semantic HTML structure; define sections, nav, footer    | Use `id` for nav anchors, class for layout grids, `aria-live`/`aria-label` for a11y                           |
| **styles.css**       | Layout, theming, responsive design via `:root` variables | No theme-specific selectors; `clamp()` for responsive font sizing; `@media (max-width: 920px)` for mobile     |
| **script.js**        | Theme toggle, chapter preview, navbar scroll behavior    | Use `requestAnimationFrame` for scroll; update DOM via `.textContent`/`.innerHTML` only, not template engines |
| **README.md**        | Project description only; no developer notes             | Update if adding build steps or new chapters                                                                  |

---

## Development Workflows

### Adding a New Chapter

1. Add object to `chapters` array in `script.js`: `{ n: 7, title: "...", preview: "...", meta: [...] }`
2. The `.learnRow` is auto-generated; no HTML changes needed
3. Test: Chapter appears in list and preview updates on click

### Updating Navbar Behavior

- Modify `updateNavbar()` function parameters: `heroHeight`, scroll threshold (currently `10px`)
- Remember to test `.scrolled` (shadow/height) and `.hide` (transform) independently

### Adding Dark Mode Support to New Components

1. Define light/dark variables in `:root` and `[data-theme="dark"]` respectively
2. Reference via `var(--name)` in component CSS
3. No JS theme-checking needed; CSS cascading handles it automatically

### Testing Theme Persistence

- Open DevTools → Application → Storage → LocalStorage
- Verify `pp_theme` key exists with value `"light"` or `"dark"` after toggle
- Clear and reload to confirm default ("light") is applied

---

## Code Conventions & Anti-Patterns

### DO:

- Use semantic HTML: `<nav aria-label="Primary">`, `<section id="home">`, `<h2>`, `<button>` (not `<div role="button">`)
- Scope CSS to classes/attributes, not bare element selectors (to prevent cascade issues)
- Use `requestAnimationFrame` for frequent scroll listeners to avoid jank
- Keep JavaScript event listeners explicit: `addEventListener("click", () => { ... })`

### DON'T:

- Add hardcoded colors—always use CSS variables
- Nest grid layouts beyond 2 levels (`.wrap > .grid2` is max; `.learnLayout` is fine at 2 cols)
- Use inline styles except for `style="width: 44px;"` (logo space—kept minimal)
- Modify `chapters` array dynamically without updating preview state

---

## External Dependencies & Build

**None.** This is a zero-dependency project:

- No npm, Webpack, or bundlers
- Load HTML in browser directly or via simple HTTP server
- No CORS or environment setup needed

---

## Known Limitations & Future Work

- **Responsive preview panel**: Currently side-by-side on desktop; collapses to stacked on mobile (`@media max-width: 920px`)
- **Chapter content**: Currently only metadata (title, preview, meta tags); actual course content not yet integrated
- **Accessibility**: Basic `aria-live` on preview, `role="switch"` on theme toggle; further testing needed
- **Mobile nav**: Currently hidden (`display: none`) at 920px; consider hamburger menu for tablet/mobile

---

## Key Files at a Glance

- **`packet_prep.html:73-88`** — Chapter preview section with live region for announcements
- **`script.js:20-32`** — `chapters` array; modify to add/remove chapters
- **`script.js:34-52`** — `setActive()` function; core preview update logic
- **`script.js:88-118`** — Navbar scroll behavior; threshold constants
- **`styles.css:1-20`** — Theme variable definitions (light + dark modes)
- **`styles.css:293-330`** — Learn layout grid and preview panel styling
