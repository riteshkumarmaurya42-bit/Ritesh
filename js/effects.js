// Ritesh Portfolio — effects.js
// Command palette (Cmd+K), click confetti, console art.

/* ---------- 1. Confetti on primary button clicks ---------- */

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-confetti]') || e.target.closest('.btn-primary')) {
    createConfetti(e.clientX, e.clientY);
  }
});

function createConfetti(x, y) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = '6px';
    el.style.height = '6px';
    el.style.background = `hsl(${260 + Math.random() * 80},100%,60%)`;
    el.style.borderRadius = '50%';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '999999';
    document.body.appendChild(el);
    const angle = Math.random() * Math.PI * 2;
    const vel = 2 + Math.random() * 6;
    el.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(angle) * vel * 20}px, ${Math.sin(angle) * vel * 20 + 60}px) scale(0)`, opacity: 0 }
      ],
      { duration: 600 + Math.random() * 400, easing: 'cubic-bezier(.25,.46,.45,.94)' }
    ).onfinish = () => el.remove();
  }
}

/* ---------- 2. Command Palette (Cmd+K / Ctrl+K) ---------- */

const palette = document.createElement('div');
palette.innerHTML = `
<div id="cmdPalette" role="dialog" aria-modal="true" aria-label="Command palette" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);z-index:100000;place-items:center">
  <div style="background:#11111b;border:1px solid rgba(255,255,255,0.1);border-radius:16px;width:90%;max-width:500px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
    <div style="padding:16px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;gap:10px;align-items:center">
      <span style="color:#9a9ab0" aria-hidden="true">⌘</span>
      <input id="paletteInput" placeholder="Type a command or search..." aria-label="Search commands" style="flex:1;background:transparent;border:none;outline:none;color:white;font-family:inherit">
      <span style="font-size:11px;color:#9a9ab0;font-family:JetBrains Mono">ESC</span>
    </div>
    <div id="paletteList" style="padding:8px;max-height:300px;overflow:auto"></div>
  </div>
</div>
`;
document.body.appendChild(palette);
const cmdPaletteEl = document.getElementById('cmdPalette');
const paletteInput = document.getElementById('paletteInput');
const paletteList = document.getElementById('paletteList');

const paletteCommands = [
  { label: 'Go to Home', action: () => (location.hash = '#home'), icon: '🏠' },
  { label: 'Open Terminal', action: () => (location.href = 'features/terminal.html'), icon: '>_' },
  { label: 'Open Tools Hub', action: () => (location.href = 'features/tools.html'), icon: '🧰' },
  { label: 'Play Games', action: () => (location.href = 'features/games.html'), icon: '🎮' },
  { label: 'Visual Playground', action: () => (location.href = 'features/visuals.html'), icon: '📊' },
  { label: 'View Projects', action: () => (location.hash = '#work'), icon: '🚀' },
  { label: 'Contact Me', action: () => (location.hash = '#contact'), icon: '📬' },
  { label: 'Toggle Theme', action: () => document.getElementById('themeToggle')?.click(), icon: '🌗' },
  { label: 'Trigger Konami Code', action: () => window.Ritesh?.triggerKonami(), icon: '🎉' },
  { label: 'Copy Email', action: copyEmail, icon: '📧' },
];

function copyEmail() {
  navigator.clipboard
    .writeText('ritesh@example.com')
    .then(() => window.Ritesh?.showToast('Email copied to clipboard 📋'))
    .catch(() => window.Ritesh?.showToast('Email: ritesh@example.com'));
}

function renderPalette(filter = '') {
  const filtered = paletteCommands.filter((c) => c.label.toLowerCase().includes(filter.toLowerCase()));
  paletteList.innerHTML = filtered.length
    ? filtered.map((c, i) => `<div class="palette-item" data-index="${i}" role="button" tabindex="0" style="padding:10px 14px;border-radius:10px;display:flex;align-items:center;gap:12px;cursor:pointer;color:#9a9ab0;transition:.2s"><span aria-hidden="true">${c.icon}</span><span style="color:white">${c.label}</span></div>`).join('')
    : '<div style="padding:16px;color:#9a9ab0;text-align:center">No matching commands</div>';
  paletteList.querySelectorAll('.palette-item').forEach((el) => {
    const cmd = filtered[Number(el.dataset.index)];
    el.addEventListener('click', () => { cmd.action(); closePalette(); });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cmd.action(); closePalette(); } });
    el.addEventListener('mouseenter', () => (el.style.background = 'rgba(255,255,255,0.05)'));
    el.addEventListener('mouseleave', () => (el.style.background = 'transparent'));
  });
}

function closePalette() {
  cmdPaletteEl.style.display = 'none';
  document.body.style.overflow = '';
}

function openPalette() {
  cmdPaletteEl.style.display = 'grid';
  document.body.style.overflow = 'hidden';
  renderPalette('');
  paletteInput.focus();
}

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openPalette();
  }
  if (e.key === 'Escape' && cmdPaletteEl.style.display !== 'none') closePalette();
});
paletteInput?.addEventListener('input', (e) => renderPalette(e.target.value));
cmdPaletteEl?.addEventListener('click', (e) => { if (e.target === cmdPaletteEl) closePalette(); });

/* ---------- 3. Easter egg: console art ---------- */

console.log(`%c
  Built with ❤️ by Ritesh
  https://github.com/riteshkumarmaurya42-bit/Ritesh

  Psst... Try Cmd+K for the command palette!
`, 'color:#7c3aed;font-family:monospace');
