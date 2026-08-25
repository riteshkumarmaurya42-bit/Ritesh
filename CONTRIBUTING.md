# Contributing to Ritesh Portfolio ⚡

Thanks for wanting to help! This repo is a playground — new tools, games, and
effects are all fair game. A few ground rules keep it fast, offline-capable,
and dependency-free.

## Dev setup

```bash
git clone https://github.com/<your-username>/Ritesh.git
cd Ritesh
npm start              # serve on http://localhost:3000
```

No install step — the site and its tooling have **zero npm dependencies**.

## Before you open a PR

Run the same checks CI runs:

```bash
npm run lint           # JS syntax, JSON, internal links, SW precache, manifest, quality gates
npm test               # site-integrity + CLI tests
# or both at once:
npm run check
```

CI also smoke-tests that every page serves with HTTP 200.

## Project conventions

- **Vanilla JS only** for runtime code — no frameworks, no bundler, no build step.
  (Chart.js via CDN on the Visual Playground is the one existing exception.)
- **Everything must work offline** — new features should not require a server or API key.
- **No blocking dialogs** — use a toast (see `showToast` in `js/main.js` or
  `gameToast` in `features/games.html`) instead of `alert`/`confirm`/`prompt`.
- **Respect `prefers-reduced-motion`** — new animations need a reduced-motion path.
- **Keyboard accessible** — interactive elements need focus states and keyboard support.
- **Mobile matters** — test changes at ~375px width.
- **Branch naming:** `feature/your-idea`, `fix/the-bug`.
- **Commit style:** conventional commits — `feat:`, `fix:`, `docs:`, `chore:`.

## Where things could grow

- [ ] More dev tools (JWT decoder, image compressor, cron parser)
- [ ] Sound effects with Web Audio API
- [ ] Three.js scene in the Visual Playground
- [ ] Multiplayer Snake (WebRTC)
- [ ] Real (opt-in) AI assistant integration
- [ ] More terminal commands & easter eggs

## Reporting bugs

Open a [bug report issue](https://github.com/riteshkumarmaurya42-bit/Ritesh/issues/new?template=bug_report.md)
with the page, browser, and steps to reproduce.

## Security issues

Please don't open public issues for vulnerabilities — see [SECURITY.md](SECURITY.md).

Let's build cool stuff together! 🚀
