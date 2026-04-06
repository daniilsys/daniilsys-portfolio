<div align="center">

# daniilsys.dev

**Personal developer portfolio — dark brutalist design, fast, no fluff.**

[![Live](https://img.shields.io/badge/live-daniilsys.dev-4DFFB4?style=flat-square&logo=vercel&logoColor=black)](https://daniilsys.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-gray?style=flat-square)](./LICENSE)

</div>

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 + React 19 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5.9 |
| Fonts | Inter · Geist Mono (Google Fonts) |
| i18n | Custom context — FR / EN |
| Forms | Formspree |
| Deploy | Heroku |

## Features

- **Boot sequence** — terminal intro with glitch & scanline effect
- **Client spotlight** — Telegram Auto-Shop Bot showcase with live metrics and Telegram UI simulation
- **Persistent navbar** — glassmorphism, scroll-triggered, active section tracking
- **Project filter** — stack-based filtering with fade animation
- **Stats bar** — hero metrics (50+ clients, projects shipped, stack)
- **i18n** — FR/EN with browser detection and instant toggle
- **Animations** — CSS-only, no libraries, `prefers-reduced-motion` respected
- **Accessibility** — skip link, semantic landmarks, visible focus states, WCAG AA contrast

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Deploy (Heroku)

```bash
heroku create daniilsys-portfolio
heroku buildpacks:set heroku/nodejs
git push heroku main
heroku domains:add daniilsys.dev
```

---

<div align="center">
<sub>MIT · built by <a href="https://daniilsys.dev">daniil</a></sub>
</div>
