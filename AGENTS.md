# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.

## Cursor Cloud specific instructions

The app is a Vite client plus an Express API on PostgreSQL. Google OAuth and `SKYLENT_AI_API_KEY` are optional; signup, the catalogue, and the learner dashboard work without them.

- Install dependencies with `npm ci`, the same command as `.github/workflows/release-gate.yml`. `postinstall` runs `prisma generate` and needs `DATABASE_URL` and `DIRECT_URL` in a gitignored `.env`.
- PostgreSQL 16 is installed on the image, but this VM blocks service autostart. Bring the cluster up with `sudo pg_ctlcluster 16 main start`, then wait for `pg_isready`. The local role and database are both named `skylent`.
- Apply schema with `npx prisma migrate deploy`. Seed an empty database with `npm run db:seed`. In development, running the seed again deletes and recreates curriculum rows.
- Run the API as `PORT=3000 npm run dev:api`. Run Vite as `PORT=8443 npm run dev`. Vite proxies `/api` to port 3000. Both scripts read `PORT`, so they must not share one value.
- `GET http://127.0.0.1:3000/api/v1/health` returns `{ "status": "ok", "db": "ok" }` when the API can reach Postgres. The site is at `http://127.0.0.1:8443/`.
