# ⚡ Ritesh — Interactive Portfolio & Exciting Features Lab

> **Not just a portfolio. A playground of ideas.**

[![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-7c3aed?style=for-the-badge)](https://riteshkumarmaurya42-bit.github.io/Ritesh/)
[![MIT License](https://img.shields.io/badge/License-MIT-06ffa5?style=for-the-badge)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-3b82ff?style=for-the-badge)](manifest.json)
[![Vanilla JS](https://img.shields.io/badge/Built%20with-Vanilla%20JS-fbbf24?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tests](https://img.shields.io/badge/tests-52%20passing-06ffa5?style=for-the-badge)](test/xray.test.js)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3b82ff?style=for-the-badge)](package.json)

This is **awesome to do this** — taken to the next level. I transformed a simple repo into a full-blown interactive experience with games, tools, terminal, visualizations, and secret easter eggs.

**Live Demo:** https://riteshkumarmaurya42-bit.github.io/Ritesh/  
**Try:** Press `Cmd+K` for command palette or `↑ ↑ ↓ ↓ ← → ← → B A` for a surprise!

---

## ✨ What's Inside? (Exciting Features)

### 🎨 Core Portfolio
- **Particle Network Background** — Interactive canvas with mouse repulsion physics
- **Custom Cursor & Magnetic Buttons** — Fluid cursor that reacts to interactive elements
- **Glassmorphism + Neumorphism UI** — Modern design with blur, gradients, and glow
- **Typewriter + Scroll Reveals** — Smooth animations powered by IntersectionObserver
- **Dark/Light Theme** — Persisted with localStorage
- **PWA Support** — Installable, offline-ready with Service Worker

### 🧪 Features Lab (4 Dedicated Pages)

#### 1. `>_ Interactive Terminal` — [Open](features/terminal.html)
A full Linux-like terminal in the browser:
- Commands: `help`, `about`, `skills`, `projects`, `ls`, `cat secret.txt`, `cowsay`, `matrix`, `sudo hire-me`
- File system mock, ascii art, easter eggs
- Try `rm -rf /` — I dare you 😅

#### 2. 🎮 Arcade Zone — [Play](features/games.html)
Three games built from scratch with Canvas API:
- **Neon Snake** — Glow effects, wrap-around walls, high score
- **Memory Matrix** — Emoji matching, move counter, best score
- **Type Speed Demon** — Real WPM, accuracy, code snippets

#### 3. 🧰 Dev Tools Hub — [Use Tools](features/tools.html)
9 tools that run 100% offline (no tracking):
- QR Generator, Password Vault (strength meter), Color Palette Generator
- JSON Formatter, Base64, Markdown Live Preview
- UUID/Hash, Regex Tester, Text Diff
- Built with Web APIs: Canvas, Crypto, Clipboard

#### 4. 📊 Visual Playground — [Explore](features/visuals.html)
Data viz & creative coding:
- Skills Radar (Chart.js), Commit Graph, Tech Doughnut
- GitHub Contributions mock (371 cells)
- **Fluid Simulation** — Particle velocity fields, mouse interaction
- 3D Tilt Cards with perspective

#### 5. 🩻 Repo X-Ray — [Analyze a repo](features/xray.html) ⭐ NEW

**The one that is actually useful.** Paste any GitHub repository and get a health
report in about four seconds — the things a star count will never tell you:

| What it measures | Why it matters |
|---|---|
| 🚌 **Bus factor** | How many people must leave before the project stalls. A bus factor of 1 is a red flag hiding behind 30k stars. |
| 🕰️ **Commit chronotype** | A real punch card of *when* work happens, using each commit's own UTC offset — so "3am" means 3am for the human who typed it. Nocturnal? Nine-to-five? Weekend passion project? |
| 📊 **Gini coefficient** | Contribution inequality. 300 contributors means nothing if one person wrote 95% of the code. |
| 📦 **Release cadence** | Average gap between releases, and how long since the last one. |
| ⚖️ **Legal & governance** | License, CONTRIBUTING, code of conduct, issue templates. |
| 🎯 **Weighted grade** | Six dimensions → one A+…F grade, with a plain-English verdict. |

Plus: **head-to-head comparison** of any two repos, Markdown export for PR comments,
JSON download, and shareable deep links (`?repo=owner/name`).

Everything runs **in your browser** against the public GitHub API — no server, no
tracking, no key required. Results are cached in `localStorage` for 30 minutes so
you do not burn the anonymous rate limit.

```bash
# The same engine also ships as a zero-dependency CLI
node bin/xray.js facebook/react
node bin/xray.js sveltejs/svelte --compare vuejs/core
node bin/xray.js astral-sh/ruff --markdown > ruff-health.md
```

```
┌─ 🩻  REPO X-RAY ────────────────────────────────────────────────────────┐
│ █▀▄   ▄     sindresorhus/got                                             │
│ █▀▄  ▀█▀    🌐 Human-friendly and powerful HTTP request                  │
│ █▄▀   ▀     83.0/100 · strong                                            │
├──────────────────────────────────────────────────────────────────────────┤
│ Popularity    ███████████████████████░░░░░  83  15%                      │
│ Activity      ██████████████████████████░░  93  25%                      │
│ Maintenance   ████████████████████████████  98  20%                      │
│ Community     ██████████████████████░░░░░░  78  15%                      │
│ Documentation ████████████████████████░░░░  86  15%                      │
│ Resilience    █████████░░░░░░░░░░░░░░░░░░░  32  10%                      │
├──────────────────────────────────────────────────────────────────────────┤
│ Sun                   ▒ ░      3                                         │
│ Mon        ░   ░▒░░ ░▒ ░   ▒  13                                         │
│ Tue                    ▒▒▓▒░  12                                         │
│ Wed      ▓▓ ░ ░░  █▒▒ ▓░ ░░   34                                         │
│ Thu  ░░     ▒  ░░▒░▒▒░ ░ ▒    21                                         │
│     ┬──┬──┬──┬──┬──┬──┬──┬──                                             │
│     0     6     12    18      hour of day                                │
├──────────────────────────────────────────────────────────────────────────┤
│ 🚌 Bus factor of 2 — just 2 people carry half the work across 100        │
│ 🌙 32% of commits happen on weekends. Somebody has a passion project.    │
│ ✨ Zero open issues at 14,934 stars — impressively tidy.                 │
└──────────────────────────────────────────────────────────────────────────┘
```

You can also run it **inside the browser terminal** — try `xray facebook/react`
in [the terminal](features/terminal.html). Same engine, three front-ends.

> 💡 Set `GITHUB_TOKEN` to lift the CLI rate limit from 60 to 5,000 requests/hour.

### 🤖 Bonus Features
- **AI Assistant Widget** — Mock AI that knows everything about me (bottom-right)
- **Command Palette** — `Cmd+K` / `Ctrl+K` to navigate anywhere
- **Konami Code** — `↑ ↑ ↓ ↓ ← → ← → B A` triggers confetti & rainbow mode
- **Contact Form** — With playful micro-interactions
- **404 Page** — Lost in space with particle background
- **CLI Tool** — `node bin/ritesh-cli.js` — Interactive terminal resume!
- **Repo X-Ray CLI** — `npm run xray -- facebook/react` — Repo health in your terminal

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/riteshkumarmaurya42-bit/Ritesh.git
cd Ritesh

# Run locally (any static server)
npx serve . -l 3000
# or
python3 -m http.server 3000

# Try the CLIs
node bin/ritesh-cli.js              # interactive resume
node bin/xray.js facebook/react     # 🩻 repo health report

# Run the test suite (no install needed)
npm test
```

Open http://localhost:3000 — Enjoy!

---

## 📁 Project Structure

```
Ritesh/
├── index.html              # Main portfolio (hero, features, work, skills, contact)
├── css/
│   └── style.css           # Design system — glassmorphism, animations, responsive
├── js/
│   ├── main.js             # Cursor, scroll, typewriter, theme, easter eggs
│   ├── particles.js        # Network particle system with mouse interaction
│   ├── effects.js          # Confetti, Cmd+K palette, extra magic
│   └── xray-engine.js      # 🩻 Scoring engine — shared by web, CLI & terminal
├── features/
│   ├── terminal.html       # Interactive terminal (now with a real `xray` command)
│   ├── tools.html          # 9 dev tools (100% offline)
│   ├── games.html          # 3 canvas games
│   ├── visuals.html        # Charts, fluid sim, tilt effects
│   └── xray.html           # 🩻 Repo X-Ray — GitHub health analyzer
├── bin/
│   ├── ritesh-cli.js       # Node.js CLI resume
│   └── xray.js             # 🩻 Repo X-Ray CLI (zero dependencies)
├── test/
│   └── xray.test.js        # 52 tests for the scoring engine
├── .github/
│   └── ci-workflow.yml.example  # Copy to workflows/ci.yml to enable CI
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline cache)
├── 404.html                # Custom 404 with particles
├── package.json
└── README.md               # You are here
```

---

## 🎯 Tech Highlights

- **Zero Frameworks** — Pure Vanilla JS for max performance
- **Canvas API** — Particle systems, fluid sim, games
- **Web APIs Used:** Clipboard, Crypto (UUID & SHA-256), IntersectionObserver, Service Worker, localStorage
- **Chart.js** — For radar, line, doughnut visualizations
- **QRCode.js** — Offline QR generation
- **Isomorphic module** — `js/xray-engine.js` is one UMD file running in the browser, in Node, and inside the web terminal
- **Tested** — 52 unit tests via `node:test`, no test framework installed
- **Performance:** 60fps animations, <100ms interactions, Lighthouse 95+
- **Accessibility:** Keyboard nav, semantic HTML, ARIA where needed

---

## 🎮 Easter Eggs Checklist

- [ ] Try `Cmd+K` command palette
- [ ] Konami Code: `↑ ↑ ↓ ↓ ← → ← → B A`
- [ ] Type `sudo hire-me` in terminal
- [ ] `cat secret.txt` in terminal
- [ ] Click any primary button for confetti
- [ ] Drag mouse in fluid simulation
- [ ] Beat Snake high score
- [ ] Ask AI about Konami code
- [ ] Try `rm -rf /` in terminal
- [ ] Find the custom cursor!
- [ ] Run `xray facebook/react` in the terminal
- [ ] X-ray your own repo and check your bus factor 😬
- [ ] Hit `surprise me 🎲` on the X-Ray page

---

## 🤝 Contributing

This is my personal portfolio, but feel free to fork and make it yours!

1. Fork the repo
2. Create feature branch: `git checkout -b feature/awesome`
3. Commit: `git commit -m 'Add awesome feature'`
4. Push: `git push origin feature/awesome`
5. Open PR

Ideas welcome: more games, more tools, WebGL shaders, multiplayer!

---

## 📬 Contact & Hire Me

I'm **available for freelance & full-time** — let's build something exciting!

- Email: `ritesh@example.com`
- GitHub: [@riteshkumarmaurya42-bit](https://github.com/riteshkumarmaurya42-bit)
- Portfolio: [Live Site](https://riteshkumarmaurya42-bit.github.io/Ritesh/)
- Terminal: `sudo hire-me`

> Response time: ~2 hours. No spam, no BS, just building cool stuff.

---

## 📜 License

MIT — Feel free to use, remix, and ship!

---

### 🌟 If you like this, please star the repo!

Built with ⚡, ☕ and infinite curiosity by **Ritesh**.

> "This is awesome to do this." — Now it's *really* awesome.

