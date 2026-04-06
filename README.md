# daniilsys.dev

Personal developer portfolio. Dark brutalist design, fast, no fluff.

**Live:** [daniilsys.dev](https://daniilsys.dev)

## Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- TypeScript
- Inter + Geist Mono (Google Fonts)

## Features

- Boot sequence intro with glitch effect
- i18n (FR/EN) with browser detection
- Persistent navbar with glassmorphism and active section tracking
- Client spotlight section with Telegram bot terminal simulation
- Project stack filter with fade animation
- Hero stats bar and available-for-freelance indicator
- Scroll-triggered animations (CSS-only, no libraries)
- `prefers-reduced-motion` support
- Skip link and semantic landmarks for keyboard accessibility
- Fully responsive

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

## License

MIT
