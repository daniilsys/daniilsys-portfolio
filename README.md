# daniilsys.dev

Personal developer portfolio. Dark brutalist design, fast, no fluff.

**Live:** [daniilsys.dev](https://daniilsys.dev)

## Stack

- Next.js 16
- Tailwind CSS 4
- TypeScript

## Features

- Boot sequence intro with glitch effect
- i18n (FR/EN) with browser detection
- Scroll-triggered animations (CSS-only, no libraries)
- `prefers-reduced-motion` support
- Fully responsive
- Static export, deploy-ready

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
