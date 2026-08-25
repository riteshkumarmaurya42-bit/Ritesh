#!/usr/bin/env node
/**
 * Ritesh — Terminal Portfolio CLI
 *
 * Interactive resume in your terminal, plus machine-readable flags for scripts:
 *
 *   node bin/ritesh-cli.js            interactive session
 *   node bin/ritesh-cli.js --json     print profile as JSON
 *   node bin/ritesh-cli.js --version  print version
 *   node bin/ritesh-cli.js --help     print usage
 */
'use strict';

const readline = require('readline');
const pkg = require('../package.json');

const colors = {
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const art = `
${colors.purple} ██████╗ ██╗████████╗███████╗███████╗██╗  ██╗
 ██╔══██╗██║╚══██╔══╝██╔════╝██╔════╝██║  ██║
 ██████╔██║   ██║   █████╗  ███████╗███████║
 ██╔══██╗██║   ██║   ██╔══╝  ╚════██║██╔══██║
 ██║  ██║██║   ██║   ███████╗███████║██║  ██║
 ╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝${colors.reset}
`;

const info = {
  name: "Ritesh",
  role: "Full-Stack Developer • Builder • Creator",
  bio: "Building delightful web experiences that matter. Obsessed with fast, beautiful, interactive products.",
  stack: ["React", "Next.js", "Node.js", "Python", "TypeScript", "WebGL", "AI"],
  projects: [
    "⚡ Neon Portfolio Engine - Blazing fast portfolio framework",
    "🧰 DevTools Superhub - 15+ offline dev tools",
    "🎮 Arcade.js - Retro game engine <10kb",
    "📊 GitViz - GitHub as 3D galaxy",
    "💻 Terminal Portfolio - You are here!"
  ],
  contact: {
    email: "ritesh@example.com",
    github: "https://github.com/riteshkumarmaurya42-bit/Ritesh",
    portfolio: "https://riteshkumarmaurya42-bit.github.io/Ritesh"
  }
};

/* ---------- Non-interactive flags (script-friendly) ---------- */

function printHelp() {
  console.log(`
${colors.bold}${pkg.name}${colors.reset} v${pkg.version} — Ritesh's terminal portfolio

${colors.cyan}Usage:${colors.reset}
  ritesh                Start the interactive session
  ritesh --json         Print profile data as JSON (great for scripts)
  ritesh --version      Print version
  ritesh --help         Show this help

${colors.cyan}Interactive commands:${colors.reset}
  ${colors.green}about${colors.reset}       Who is Ritesh?
  ${colors.green}skills${colors.reset}      Tech stack
  ${colors.green}projects${colors.reset}    What I built
  ${colors.green}contact${colors.reset}     Get in touch
  ${colors.green}game${colors.reset}        Play a mini game
  ${colors.green}hire${colors.reset}        Start a conversation 🚀
  ${colors.green}clear${colors.reset}       Clear screen
  ${colors.green}exit${colors.reset}        Exit
`);
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}
if (args.includes('--version') || args.includes('-v')) {
  console.log(pkg.version);
  process.exit(0);
}
if (args.includes('--json')) {
  console.log(JSON.stringify({ ...info, version: pkg.version }, null, 2));
  process.exit(0);
}

/* ---------- Interactive session ---------- */

function showHelp() {
  console.log(`
${colors.cyan}Available commands:${colors.reset}
  ${colors.green}about${colors.reset}       - Who is Ritesh?
  ${colors.green}skills${colors.reset}      - Tech stack
  ${colors.green}projects${colors.reset}    - What I built
  ${colors.green}contact${colors.reset}     - Get in touch
  ${colors.green}clear${colors.reset}       - Clear screen
  ${colors.green}help${colors.reset}        - Show this help
  ${colors.green}hire${colors.reset}        - Work with Ritesh 🚀
  ${colors.green}game${colors.reset}        - Play a mini game
  ${colors.green}exit${colors.reset}        - Exit CLI
`);
}

function showAbout() {
  console.log(`\n${colors.bold}${colors.purple}${info.name}${colors.reset} - ${info.role}\n`);
  console.log(info.bio);
  console.log(`\n${colors.yellow}Motto: "Build delightful things that matter."${colors.reset}\n`);
}

function showSkills() {
  console.log(`\n${colors.cyan}⚡ TECH STACK${colors.reset}`);
  console.log(`Frontend: React, Next.js, Vue, Tailwind, Framer Motion`);
  console.log(`Backend: Node.js, Python, Go, Postgres, Redis`);
  console.log(`Creative: WebGL, Canvas, Three.js, Shaders`);
  console.log(`AI: LangChain, OpenAI, Vector DBs, RAG\n`);
  console.log(`${colors.green}███████████████░░ 95% Frontend${colors.reset}`);
}

function showProjects() {
  console.log(`\n${colors.cyan}🚀 SELECTED WORK${colors.reset}`);
  info.projects.forEach((p, i) => console.log(`${i + 1}. ${p}`));
  console.log();
}

function showContact() {
  console.log(`\n${colors.cyan}📬 CONTACT${colors.reset}`);
  console.log(`Email: ${info.contact.email}`);
  console.log(`GitHub: ${info.contact.github}`);
  console.log(`Portfolio: ${info.contact.portfolio}`);
  console.log(`Status: ${colors.green}● Available for new projects${colors.reset}\n`);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let gameActive = false;

function playGame() {
  if (gameActive) return;
  gameActive = true;
  console.log(`\n${colors.yellow}🎮 Mini Game: Guess the number (1-10)${colors.reset}`);
  const num = Math.floor(Math.random() * 10) + 1;
  rl.question('Your guess: ', ans => {
    if (parseInt(ans, 10) === num) console.log(`${colors.green}🎉 Correct! You are awesome!${colors.reset}\n`);
    else console.log(`${colors.red}Oops! It was ${num}. Try again with 'game' command!${colors.reset}\n`);
    gameActive = false;
    promptLine();
  });
}

function promptLine() {
  rl.question(`${colors.green}ritesh@portfolio${colors.reset}:${colors.purple}~$${colors.reset} `, (cmd) => {
    const c = cmd.trim().toLowerCase();
    if (c === 'exit' || c === 'quit') { console.log('Bye! Go build something great! ⚡'); rl.close(); return; }
    if (c === 'help') showHelp();
    else if (c === 'about') showAbout();
    else if (c === 'skills') showSkills();
    else if (c === 'projects') showProjects();
    else if (c === 'contact') showContact();
    else if (c === 'clear') console.clear();
    else if (c === 'hire' || c === 'sudo hire-me') { console.log(`\n${colors.green}🚀 Hiring sequence initiated... SUCCESS! Email: ${info.contact.email}${colors.reset}\n`); }
    else if (c === 'game') { playGame(); return; }
    else if (c === '') {}
    else console.log(`${colors.red}Command not found: ${cmd}${colors.reset} — Type 'help' for commands`);
    promptLine();
  });
}

console.clear();
console.log(art);
console.log(`${colors.cyan}Welcome to Ritesh's CLI Portfolio v${pkg.version} — Type 'help' to start!${colors.reset}\n`);

if (process.stdin.isTTY) {
  promptLine();
} else {
  // Piped/closed stdin (e.g. CI): print a summary instead of hanging.
  showAbout();
  showContact();
  console.log(`${colors.yellow}Tip: run with --help for non-interactive options.${colors.reset}\n`);
  rl.close();
}
