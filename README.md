# Personal Website

A lightweight single-page portfolio built with **React + Vite** and deployed on **GitHub Pages**.

## Stack
- **React** (hooks, functional components)
- **Vite** (ESM build + `import.meta.glob` for assets)
- **Vanilla CSS** (theme via CSS variables + animations)
- **Hash routing** (no React Router)

## How it works

### Pages / routing
- Two routes handled via `window.location.hash`:
  - `#` → **Home**
  - `#certificates` → **Certificates**
- On `hashchange` the app switches page and scrolls to top.

### Theme system (Light / Dark)
- Theme is applied through `document.body.dataset.theme` (`light` / `dark`).
- Supports:
  - manual toggle (user override)
  - system theme (`prefers-color-scheme`)
  - persistence via `localStorage`
  - auto-reset to system if OS theme changed since last visit

### Navigation + scroll UX
- **Scroll spy** highlights the current section based on scroll position (with a moving “anchor” inside the viewport).
- **Section dots** act like a mini navigation (click → smooth scroll).
- A **Scroll-to-top** button appears only on wide screens when the header is out of view.
- A subtle gold highlight/angle effect is driven by scroll progress using CSS custom properties.

### Certificates data model (auto-generated)
- Certificates are loaded from the filesystem using `import.meta.glob` and converted into structured data:
  - grouped by **organization** (folder name)
  - grouped by **course name** (file name)
  - multi-page certificates supported via `name_1`, `name_2`, etc.
- Total counts are computed dynamically and rendered in UI.
- The certificates page has provider **filters**, and the list lazy-expands for smoother initial render.

### Modals & galleries
- Image modals are rendered via **React Portal** (`createPortal`) to `document.body`.
- Carousels:
  - **Crossfade** transitions with double-buffered “front/back” slots
  - optional **autoplay**
  - image **preload + decode** to reduce flicker
  - keyboard controls (`Esc`, `←`, `→`)
- Certificates modal supports a **page-flip animation** for multi-page PDFs/images.

### Styling
- “Gold UI” look built with gradients, shadows, and CSS variables.
- Responsive header: switches to compact layout around tablet width.
- Custom scrollbars.

## Notes
- No external UI libraries: everything is implemented with plain React + CSS.
- Assets (certificates and project galleries) are bundled automatically by Vite via glob imports.