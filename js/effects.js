// Extra Exciting Effects - Ritesh Portfolio

// 1. Konfetti on click for buttons with data-confetti
document.addEventListener('click', (e)=>{
  if(e.target.closest('[data-confetti]') || e.target.classList.contains('btn-primary')){
    createConfetti(e.clientX, e.clientY);
  }
});

function createConfetti(x,y){
  for(let i=0;i<12;i++){
    const el=document.createElement('div');
    el.style.position='fixed';
    el.style.left=x+'px';
    el.style.top=y+'px';
    el.style.width='6px'; el.style.height='6px';
    el.style.background=`hsl(${260+Math.random()*80},100%,60%)`;
    el.style.borderRadius='50%';
    el.style.pointerEvents='none';
    el.style.zIndex='999999';
    document.body.appendChild(el);
    const angle=Math.random()*Math.PI*2;
    const vel=2+Math.random()*6;
    el.animate([
      {transform:`translate(0,0) scale(1)`, opacity:1},
      {transform:`translate(${Math.cos(angle)*vel*20}px, ${Math.sin(angle)*vel*20+60}px) scale(0)`, opacity:0}
    ], {duration:600+Math.random()*400, easing:'cubic-bezier(.25,.46,.45,.94)'}).onfinish=()=>el.remove();
  }
}

// 2. Dynamic favicon pulse
let faviconHue=0;
setInterval(()=>{
  faviconHue=(faviconHue+1)%360;
  // subtle title bar effect if tab not active handled by browser
},100);

// 3. Command Palette (Cmd+K)
const palette = document.createElement('div');
palette.innerHTML=`
<div id="cmdPalette" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);z-index:100000;place-items:center">
  <div style="background:#11111b;border:1px solid rgba(255,255,255,0.1);border-radius:16px;width:90%;max-width:500px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
    <div style="padding:16px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;gap:10px;align-items:center">
      <span style="color:#9a9ab0">⌘</span>
      <input id="paletteInput" placeholder="Type a command or search..." style="flex:1;background:transparent;border:none;outline:none;color:white;font-family:inherit">
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

const paletteCommands=[
  {label:'Go to Home', action:()=>location.href='#home', icon:'🏠'},
  {label:'Open Terminal', action:()=>location.href='features/terminal.html', icon:'>_'},
  {label:'Open Tools Hub', action:()=>location.href='features/tools.html', icon:'🧰'},
  {label:'Play Games', action:()=>location.href='features/games.html', icon:'🎮'},
  {label:'Visual Playground', action:()=>location.href='features/visuals.html', icon:'📊'},
  {label:'View Projects', action:()=>location.href='#work', icon:'🚀'},
  {label:'Contact Me', action:()=>location.href='#contact', icon:'📬'},
  {label:'Toggle Theme', action:()=>document.getElementById('themeToggle')?.click(), icon:'🌗'},
  {label:'Trigger Konami Code', action:()=>{ const e=new KeyboardEvent('keydown',{key:'a'}); /* fake */ document.body.classList.add('konami-active'); setTimeout(()=>document.body.classList.remove('konami-active'),2000); }, icon:'🎉'},
  {label:'Copy Email', action:()=>{navigator.clipboard.writeText('ritesh@example.com'); alert('Email copied!')}, icon:'📧'},
];

function renderPalette(filter=''){
  const filtered = paletteCommands.filter(c=>c.label.toLowerCase().includes(filter.toLowerCase()));
  paletteList.innerHTML=filtered.map(c=>`<div class="palette-item" style="padding:10px 14px;border-radius:10px;display:flex;align-items:center;gap:12px;cursor:pointer;color:#9a9ab0;transition:.2s"><span>${c.icon}</span><span style="color:white">${c.label}</span></div>`).join('');
  paletteList.querySelectorAll('.palette-item').forEach((el,i)=>{
    el.addEventListener('click', ()=>{ filtered[i].action(); cmdPaletteEl.style.display='none'; });
    el.addEventListener('mouseenter', ()=>el.style.background='rgba(255,255,255,0.05)');
    el.addEventListener('mouseleave', ()=>el.style.background='transparent');
  });
}

document.addEventListener('keydown', e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){
    e.preventDefault();
    cmdPaletteEl.style.display='grid';
    paletteInput.focus();
    renderPalette('');
  }
  if(e.key==='Escape') cmdPaletteEl.style.display='none';
});
paletteInput?.addEventListener('input', e=>renderPalette(e.target.value));
cmdPaletteEl?.addEventListener('click', e=>{ if(e.target===cmdPaletteEl) cmdPaletteEl.style.display='none'; });

// 4. Performance: Lazy load images if any
if('IntersectionObserver' in window){
  const imgObserver=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{ if(entry.isIntersecting){ entry.target.classList.add('in'); imgObserver.unobserve(entry.target); } });
  });
  document.querySelectorAll('.reveal').forEach(el=>imgObserver.observe(el));
}

// 5. Easter egg: console art
console.log(`%c
  Built with ❤️ by Ritesh
  https://github.com/riteshkumarmaurya42-bit/Ritesh
  
  Psst... Try Cmd+K for command palette!
`, 'color:#7c3aed;font-family:monospace');
