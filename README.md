# ⚡ Ritesh — Interactive Portfolio & Exciting Features Lab

> **Not just a portfolio. A playground of ideas.**

[![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-7c3aed?style=for-the-badge)](https://riteshkumarmaurya42-bit.github.io/Ritesh/)
[![MIT License](https://img.shields.io/badge/License-MIT-06ffa5?style=for-the-badge)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-3b82ff?style=for-the-badge)](manifest.json)
[![Vanilla JS](https://img.shields.io/badge/Built%20with-Vanilla%20JS-fbbf24?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

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

### 🤖 Bonus Features
- **AI Assistant Widget** — Mock AI that knows everything about me (bottom-right)
- **Command Palette** — `Cmd+K` / `Ctrl+K` to navigate anywhere
- **Konami Code** — `↑ ↑ ↓ ↓ ← → ← → B A` triggers confetti & rainbow mode
- **Contact Form** — With playful micro-interactions
- **404 Page** — Lost in space with particle background
- **CLI Tool** — `node bin/ritesh-cli.js` — Interactive terminal resume!

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

# Try CLI
node bin/ritesh-cli.js
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
│   └── effects.js          # Confetti, Cmd+K palette, extra magic
├── features/
│   ├── terminal.html       # Interactive terminal portfolio
│   ├── tools.html          # 9 dev tools (100% offline)
│   ├── games.html          # 3 canvas games
│   └── visuals.html        # Charts, fluid sim, tilt effects
├── bin/
│   └── ritesh-cli.js       # Node.js CLI resume
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages auto-deploy
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

