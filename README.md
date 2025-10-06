# Landing Page – Specification

---

## 1  Purpose & Objectives

* **Primary**: Showcase open‑source projects from GitHub and list all blog posts stored in `/posts`.
* **Secondary**: Publish a comprehensive `repo‑manifest.json` artefact (all files, metadata) for reuse in other projects.

---

## 2  Global Layout & Theming

| Topic          | Requirement                                                                                |
| -------------- | ------------------------------------------------------------------------------------------ |
| Base theme     | Dark (`#121212` body). Light greys `#e0e0e0` for body text, pure white for headings & CTA. |
| Responsiveness | Fluid mobile‑first design, 320 px → ≥1920 px; **no horizontal scroll**.                    |
| Overflow       | Vertical scroll only; horizontal overflow hidden on `body` & `html`.                       |
| Fonts          | Google Fonts **Open Sans 400 / 600**.                                                      |
| Motion safety  | All animations disabled when `prefers‑reduced‑motion: reduce`.                             |

---

## 3  High‑Level Architecture

```
GitHub repo              GitHub Action (Node 20)              GitHub Pages (static)
┌──────────────┐   push   ┌────────────────────┐   commit    ┌────────────────────┐
│  main branch │ ───────► │ build‑manifest.js  │ ──────────► │ /index.html        │
│  /posts/*    │          │ outputs repo‑manifest.json       │ /assets/*          │
└──────────────┘          └────────────────────┘             │ repo‑manifest.json │
                                                             │ .css /.js          │
                                                             └────────────────────┘
```

* **Action trigger**: every push to `main` (see §7).
* **Runtime**: Node 20 via `actions/setup‑node@v4`.
* **Hosting**: Same `main` branch via GitHub Pages.

---

## 4  Feature Breakdown & UI Behaviours

### 4.1  Hero Section (`100vh`)

| Element             | Behaviour                                                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title `csutil.com`  | Letters appear **sequentially**: translateY(+40 px) ➜ 0 and rotateX(90°) ➜ 0° with 50 ms stagger.                                                                                            |
| Tagline             | Fade‑in + small slide‑up 300 ms after last title letter.                                                                                                                                     |
| CTA “Show Projects” | • Fade & slide‑up after tagline.<br>• **Hover**: tilts toward cursor (max 5° on X/Y), returns on `mouseleave`.<br>• **Click**: smooth‑scroll to Projects section (`scroll‑behavior:smooth`). |

### 4.2  Animated Background

| Asset                     | Details                                                                                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blurred blobs             | 3 absolutely‑positioned `<div>`s below content (`z‑index:-1`). Each 300‑400 px circle with CSS `filter:blur(120px)`; colored gradients (violet, teal, indigo). Animate `transform: translate()` & `scale()` slowly (30 s loop). |
| Decorative gradient tiles | Each project card gets an individual radial/linear gradient background that shifts position (`background‑position`) on a 20 s linear loop for a subtle fade.                                                                    |

### 4.3  Projects Section

| Topic       | Implementation                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Data source | `https://api.github.com/users/cs-util-com/repos?per_page=100&sort=updated` (unauthenticated).                                        |
| Grid        | CSS Grid with `grid-template-columns: repeat(auto‑fit,minmax(280px,1fr))`. Consistent card height by flex column layout.             |
| Card entry  | `opacity:0; translateY(50px); rotateX(15°)` ➜ `opacity:1; translateY(0); rotateX(0)` as card enters viewport (IntersectionObserver). |
| Hover       | `transform:scale(1.03) rotateX(var(--rx)) rotateY(var(--ry)); box‑shadow` deepens. Mouse position maps to `--rx/ry` (≤7°).           |
| Depth       | Title, description, meta have incremental `transform:translateZ()` to create parallax while tilting.                                 |
| Fields      | Name, description (if any), `created_at`, `updated_at` (format `YYYY MM DD`), GitHub link (opens new tab), optional homepage link labelled **“Open Project”.** |
| Card click  | Entire card is keyboard and pointer clickable; opens homepage when available, otherwise the GitHub repository, in a new tab (`noopener`,`noreferrer`). |
| Error       | Show message *“Projects could not be loaded. View them on GitHub.”* + link.                                                          |

### 4.4  Blog Posts Section

| Topic       | Implementation                                                                               |
| ----------- | -------------------------------------------------------------------------------------------- |
| Data source | `/repo-manifest.json` → filter files matching `posts/\d{4}-\d{2}-\d{2}-.*\.html$`.           |
| Sort        | Newest first by parsed date.                                                                 |
| Card layout | 1 per row, max‑width 480 px center‑aligned. Rounded 8 px, `#1d1d1d` background, soft shadow. |
| Display     | Title (clickable, whole card), date on second italic line.                                   |
| Hover       | `translateY(-2px)` shadow intensifies.                                                       |
| Error       | Show *“Blog posts unavailable. Browse directly on GitHub.”* + link to `/posts` folder.       |

---

## 5  GitHub Action – `manifest.yml`

```yaml
name: Build repo‑manifest
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: '20'}
      - name: Generate manifest
        run: node scripts/build-manifest.js
      - name: Commit & push
        uses: EndBug/add-and-commit@v9
        with:
          add: 'repo-manifest.json'
          message: 'chore: update repo-manifest [skip ci]'
          push: true
```

### 5.1  `build-manifest.js` Requirements

* Recursively list **all** content via GitHub REST `repos.getContent`.
* Output array of `{ path, name, sha, size, download_url, type }`.
* `JSON.stringify(data,null,2)` to `repo-manifest.json`.

---

## 6  Front‑End Tech Stack

* **HTML / ES6 / CSS** – no heavy frameworks.
* Utility libraries allowed: **IntersectionObserver polyfill**, **simpletilt.js** for tilt math (or handcrafted).
* Bundler optional (Vite) but deliver a single `dist` folder of static assets.

---

## 7  Animation & Interaction Guidelines

| Guideline     | Detail                                                                               |
| ------------- | ------------------------------------------------------------------------------------ |
| Easing        | Use `cubic-bezier(0.25,0.8,0.25,1)` ease‑out for most transitions.                   |
| Duration      | Entry = 600 ms; hover lifts = 150 ms.                                                |
| Performance   | Use `will-change` for transform/opacity. Avoid animating layout‑affecting props.     |
| Accessibility | Disable all transforms/opacity changes >100 ms when `prefers-reduced-motion` active. |

---

## 8  Styling Tokens (CSS Custom Properties)

```css
:root {
  --bg: #121212;
  --card-bg: #1d1d1d;
  --text: #e0e0e0;
  --heading: #ffffff;
  --accent: #64B5F6;
  --radius: 8px;
  --shadow: 0 2px 6px rgba(0,0,0,.4);
}
```

---

## 9  Testing & Quality Targets

| Area          | Tool                  | Passing Criteria                                                                                |
| ------------- | --------------------- | ----------------------------------------------------------------------------------------------- |
| Performance   | Lighthouse Mobile     | ≥ 90 overall.                                                                                   |
| Accessibility | Pa11y                 | No WCAG 2.1 AA errors.                                                                          |
| Unit          | Jest (build‑manifest) | 100% happy path + edge cases.                                                                   |
| E2E           | Cypress               | Hero animation runs, project cards load, blog list matches manifest count, error states render. |

---

## 10  Future Enhancements

* Add Contact / social section.
* Light‑mode toggle.
* Pagination for projects & posts when counts grow large.
* Compress & upload manifest to Release when size >5 MB.