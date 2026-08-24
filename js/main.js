// Ritesh Portfolio - Main JS - Exciting Features
console.log('%c⚡ Ritesh Portfolio Loaded', 'color:#7c3aed;font-size:20px;font-weight:bold');
console.log('%cTry the Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A', 'color:#06ffa5');

// Loader
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').style.transform = 'translateY(-100%)';
  }, 800);
});

// Scroll Progress
window.addEventListener('scroll', () => {
  const winScroll = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  document.getElementById('progress').style.width = scrolled + '%';
});

// Custom Cursor
const cursor = document.querySelector('.cursor');
const dot = document.querySelector('.cursor-dot');
let mouseX = 0, mouseY = 0, curX = 0, curY = 0, dotX = 0, dotY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  if(dot){ dotX = e.clientX; dotY = e.clientY; dot.style.left = dotX + 'px'; dot.style.top = dotY + 'px'; }
});
(function animateCursor(){
  curX += (mouseX - curX) * 0.15;
  curY += (mouseY - curY) * 0.15;
  if(cursor){ cursor.style.left = curX - 10 + 'px'; cursor.style.top = curY - 10 + 'px'; }
  requestAnimationFrame(animateCursor);
})();
document.querySelectorAll('a, button, .feature-card, .project').forEach(el=>{
  el.addEventListener('mouseenter', ()=> cursor?.classList.add('hover'));
  el.addEventListener('mouseleave', ()=> cursor?.classList.remove('hover'));
});

// Magnetic Buttons
document.querySelectorAll('.magnetic').forEach(btn=>{
  btn.addEventListener('mousemove', (e)=>{
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width/2;
    const y = e.clientY - rect.top - rect.height/2;
    btn.style.transform = `translate(${x*0.25}px, ${y*0.4}px)`;
  });
  btn.addEventListener('mouseleave', ()=> btn.style.transform = 'translate(0,0)');
});

// Reveal on Scroll
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      // Animate skill bars
      if(entry.target.classList.contains('skill-bar')){
        const fill = entry.target.querySelector('.fill');
        fill.style.width = fill.dataset.width + '%';
      }
    }
  });
}, {threshold:0.15});
document.querySelectorAll('.reveal, .skill-bar').forEach(el=>observer.observe(el));

// Feature Cards mouse glow
document.querySelectorAll('.feature-card').forEach(card=>{
  card.addEventListener('mousemove', (e)=>{
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--x', (e.clientX - rect.left) + 'px');
    card.style.setProperty('--y', (e.clientY - rect.top) + 'px');
  });
});

// Typewriter
const roles = ["Full-Stack Developer", "UI Engineer", "Open Source Builder", "Problem Solver"];
let roleIndex = 0, charIndex = 0, isDeleting = false;
const typeEl = document.getElementById('typewriter');
function typeLoop(){
  if(!typeEl) return;
  const current = roles[roleIndex];
  if(isDeleting){
    typeEl.textContent = current.substring(0, charIndex-1);
    charIndex--;
  } else {
    typeEl.textContent = current.substring(0, charIndex+1);
    charIndex++;
  }
  let speed = isDeleting ? 40 : 90;
  if(!isDeleting && charIndex === current.length){
    speed = 1500; isDeleting = true;
  } else if(isDeleting && charIndex === 0){
    isDeleting = false; roleIndex = (roleIndex+1) % roles.length; speed = 500;
  }
  setTimeout(typeLoop, speed);
}
typeLoop();

// Theme Toggle
const themeBtn = document.getElementById('themeToggle');
let theme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', theme);
themeBtn?.addEventListener('click', ()=>{
  theme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
});
if(themeBtn) themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';

// Active Nav
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav ul a');
window.addEventListener('scroll', ()=>{
  let current = '';
  sections.forEach(sec=>{
    const top = sec.offsetTop - 150;
    if(window.scrollY >= top) current = sec.getAttribute('id');
  });
  navLinks.forEach(a=>{
    a.classList.remove('active');
    if(a.getAttribute('href') === '#'+current) a.classList.add('active');
  });
});

// Contact Form Mock
document.getElementById('contactForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const orig = btn.textContent;
  btn.textContent = 'Sending... ⏳';
  setTimeout(()=>{
    btn.textContent = 'Message Sent! 🎉';
    btn.style.background = 'linear-gradient(135deg,#06ffa5,#3b82ff)';
    setTimeout(()=>{ btn.textContent = orig; btn.style.background=''; e.target.reset(); }, 2000);
  }, 1200);
});

// Konami Code Easter Egg
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let kIndex = 0;
document.addEventListener('keydown', (e)=>{
  if(e.key === konami[kIndex]){ kIndex++; if(kIndex===konami.length){ activateEasterEgg(); kIndex=0; } }
  else kIndex=0;
});
function activateEasterEgg(){
  document.body.classList.add('konami-active');
  const audio = new Audio();
  // Confetti
  for(let i=0;i<100;i++){
    const conf = document.createElement('div');
    conf.style.position='fixed';
    conf.style.left=Math.random()*100+'vw';
    conf.style.top='-10px';
    conf.style.width='8px'; conf.style.height='8px';
    conf.style.background=`hsl(${Math.random()*360},100%,50%)`;
    conf.style.zIndex='999999'; conf.style.borderRadius='50%';
    conf.style.pointerEvents='none';
    document.body.appendChild(conf);
    conf.animate([{transform:'translateY(0) rotate(0)', opacity:1},{transform:`translateY(${100+Math.random()*50}vh) rotate(${720*Math.random()}deg)`, opacity:0}], {duration:2000+Math.random()*2000, easing:'cubic-bezier(.25,.46,.45,.94)'}).onfinish=()=>conf.remove();
  }
  setTimeout(()=>document.body.classList.remove('konami-active'), 3000);
  alert('🎉 KONAMI CODE ACTIVATED! You found the secret! You are officially awesome.');
}

// Tilt Effect for Projects
document.querySelectorAll('.project').forEach(card=>{
  card.addEventListener('mousemove', (e)=>{
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const centerX = rect.width/2; const centerY = rect.height/2;
    const rotateX = (y - centerY) / 10; const rotateY = (centerX - x) / 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });
  card.addEventListener('mouseleave', ()=> card.style.transform = '');
});

// Dynamic Greeting
const hour = new Date().getHours();
let greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
const greetEl = document.getElementById('greeting');
if(greetEl) greetEl.textContent = greet;
