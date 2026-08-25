# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] — 2026-08-24

### Added
- **CI** (`.github/workflows/ci.yml`): lint + tests + served smoke test on every push/PR.
- **Deploy** (`.github/workflows/deploy.yml`): real GitHub Pages workflow — lint, test, regenerate icons, deploy.
- **Linting** (`npm run lint`): dependency-free checks for JS syntax, JSON validity, internal links, anchors, service-worker precache, manifest icons, and quality gates.
- **Tests** (`npm test`): site integrity + CLI test suite using Node's built-in test runner.
- **PWA icons** (`npm run icons`): zero-dependency PNG generator — 192/512, maskable, and apple-touch icons (brand lightning bolt).
- **Manifest**: `start_url`/`scope` fixed for GitHub Pages subpaths, real PNG icons, and app shortcuts (Terminal / Arcade / Tools).
- **SEO/social**: Open Graph + Twitter cards + canonical URLs + `theme-color` on every page; `og:image` wired to `assets/banner.png`.
- **Skip-to-content link**, `<main>` landmark, `aria-label`s, `role="dialog"` for palette/chat, `aria-live` chat log, `<noscript>` fallback.
- **CLI flags**: `--json` (machine-readable profile), `--version`, `--help` — makes `bin/ritesh-cli.js` scriptable and CI-testable.
- Community files: issue templates, PR template, Dependabot, `.editorconfig`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.

### Changed
- Service worker: network-first for page navigations with offline fallback, cache-only-GET guard, complete precache list (was missing `effects.js`, `manifest.json`, `404.html`).
- `index.html` now links `manifest.json` (the PWA was previously advertised but never wired up).
- Contact form honestly hands off to the visitor's mail app (mailto) instead of pretending to send.
- AI widget extracted from inline `<script>` to `js/ai-widget.js`; labeled as a demo bot.
- Scroll handlers merged and rAF-throttled; particles pause on hidden tabs, scale with viewport, cap DPR at 2.
- Command palette: keyboard-navigable items, ESC/backdrop close, no more fake actions.

### Fixed
- Blocking `alert()` calls replaced with non-blocking toasts (Konami code, copy-email, game wins, typing test).
- Touch devices no longer get an invisible custom cursor (`hover`/`pointer` media queries).
- `prefers-reduced-motion` now disables particles, typewriter, confetti, magnetic buttons, and tilt effects.
- Dead `href="#"` links on project cards now point to the real repo.
- Removed a 10×/second no-op `setInterval` from `effects.js`.
- Nested-readline bug in the CLI mini-game.
- Placeholder/unprofessional copy cleaned up (no profanity in shipped content).

## [2.0.0] — Initial "Features Lab" release

Interactive portfolio with terminal, arcade, dev tools hub, visual playground,
PWA support, CLI resume, and easter eggs.
