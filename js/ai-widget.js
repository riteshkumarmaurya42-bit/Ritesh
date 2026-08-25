// Ritesh Portfolio — ai-widget.js
// The demo assistant in the corner. A small, honest mock: keyword-matched
// answers about Ritesh's work. No network calls, no tracking.
(function () {
  'use strict';

  const aiToggle = document.getElementById('aiToggle');
  const aiChat = document.getElementById('aiChat');
  const aiMessages = document.getElementById('aiMessages');
  const aiInput = document.getElementById('aiInput');
  const aiSend = document.getElementById('aiSend');
  if (!aiToggle || !aiChat) return;

  let open = false;

  function setOpen(next) {
    open = next;
    aiChat.style.display = open ? 'block' : 'none';
    aiToggle.setAttribute('aria-expanded', String(open));
    if (open) aiInput.focus();
  }

  aiToggle.addEventListener('click', () => setOpen(!open));
  document.getElementById('aiClose')?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false);
  });

  function addMsg(text, isUser = false) {
    const div = document.createElement('div');
    div.style.padding = '10px 14px';
    div.style.borderRadius = '14px';
    div.style.maxWidth = '85%';
    div.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
    div.style.background = isUser ? 'linear-gradient(135deg,var(--accent),var(--accent4))' : 'var(--card)';
    div.style.color = isUser ? 'white' : 'var(--text)';
    div.style.borderTopRightRadius = isUser ? '4px' : '14px';
    div.style.borderTopLeftRadius = isUser ? '14px' : '4px';
    div.textContent = text;
    aiMessages.appendChild(div);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  const responses = {
    skills: 'Ritesh works primarily with React, Next.js, Node, and Python, and loves WebGL & AI. 95% frontend, 88% backend — full-stack.',
    projects: 'Highlights: Neon Portfolio Engine, DevTools Hub (15+ tools), Arcade.js, the GitViz 3D GitHub visualizer, and a full terminal portfolio. Check the Work section!',
    hire: 'He is available for freelance and full-time roles. Fast, creative, ships quality code. Email is in the Contact section 🚀',
    default: "That's cool! Ritesh is a full-stack dev focused on building delightful web experiences. Ask me about his skills, projects, or how to get in touch."
  };

  function aiReply(q) {
    q = q.toLowerCase();
    let r = responses.default;
    if (q.includes('skill') || q.includes('stack') || q.includes('tech')) r = responses.skills;
    else if (q.includes('project') || q.includes('work') || q.includes('build')) r = responses.projects;
    else if (q.includes('hire') || q.includes('contact') || q.includes('job') || q.includes('freelance')) r = responses.hire;
    else if (q.includes('hello') || q.includes('hi') || q.includes('hey')) r = "Hey there! 👋 I'm Ritesh's demo assistant. What do you want to know?";
    else if (q.includes('game')) r = 'Arcade Zone has Snake, Memory Matrix, and a typing test. Try to beat the high score! 🎮';
    else if (q.includes('konami')) r = 'Shhh 🤫 You know about the Konami Code? ↑↑↓↓←→←→BA — try it on the homepage!';
    setTimeout(() => addMsg(r), 600);
  }

  function sendAI() {
    const v = aiInput.value.trim();
    if (!v) return;
    addMsg(v, true);
    aiInput.value = '';
    aiReply(v);
  }

  aiSend.addEventListener('click', sendAI);
  aiInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendAI(); });
})();
