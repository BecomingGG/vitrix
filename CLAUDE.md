# VITRIX — project notes

VITRIX is a website for an emergency-medicine training institute (Tbilisi, Georgia).
Medical students and clinicians browse courses (ACLS, ATLS, PHTLS, BLS, Critical Care,
Simulation), apply, and — eventually — buy courses and see them in their account.

The site is a **static Angular app** published on **GitHub Pages**
(<https://becominggg.github.io/vitrix/>, from the `gh-pages` branch). Accounts come from the
separate **identity-api** server (repo `BecomingGG/identity-api`), deployed on Render at
<https://vitrix-identity.onrender.com> with a Neon Postgres database. Forms have no backend yet.

## Commands

```bash
npm install       # once
npm start         # dev server at http://localhost:4200
npm run build     # production build into dist/vitrix/browser
```

No test files exist yet (`skipTests: true` in angular.json).

## Stack and conventions

- Angular 21, standalone components, **signals** for state, reactive forms, lazy-loaded routes.
- File naming: `pages/<name>/<name>.ts` + `<name>.html`, class name `PascalCase` without a
  `Component` suffix (e.g. `Login`, `Account`).
- Almost all CSS lives in [src/styles.scss](src/styles.scss) (global). Components rarely have
  their own styles. Reuse existing classes: `page-hero`, `page-section`, `wrap`, `split`,
  `form`, `notice`, `btn btn-red`, `btn btn-ghost`, `eyebrow`, `lede`, `course-row`, `info-card`.
- Design: dark background, red accent `--red`, display font Oswald (uppercase), body Manrope.
  Mobile breakpoints at 1100px, 860px, 640px.
- Formatting: Prettier (`.prettierrc`), single quotes, 100-char lines.
- Images live in `public/media/` and are referenced as `media/x.jpg` (no leading slash) so they
  work on GitHub Pages.

## Map of the code

| Path | What it is |
| --- | --- |
| [src/app/app.routes.ts](src/app/app.routes.ts) | All routes. `data.title` sets the browser tab title. |
| [src/app/site-data.ts](src/app/site-data.ts) | All content: nav, courses, faculty, partners, stats. Edit text here. |
| [src/app/auth.ts](src/app/auth.ts) | `Auth` service (login / register / logout, current member signal) and `authGuard`. |
| [src/app/auth.config.ts](src/app/auth.config.ts) | Identity server URL, client id `vitrix`, scopes, and when login is switched on. |
| [src/app/notify.ts](src/app/notify.ts) | `Notify` service: short toast messages (`success`, `info`, `error`), shown by the app shell. |
| [src/app/layout/](src/app/layout/) | Header (nav, search, login link, mobile menu) and footer. |
| [src/app/mark.ts](src/app/mark.ts) | The VITRIX logo as an SVG component. |
| `src/app/pages/*` | One folder per page: home, about, courses, simulation, faculty, partners, contact, apply, login, account. |

## Login (current state)

Accounts live on **identity-api** (ASP.NET Core Identity + OpenIddict, one instance per project).
VITRIX shows its **own login form** — visitors never leave the site:

- Log in: `POST {IDENTITY_URL}/connect/token` with `grant_type=password` (client `vitrix`).
- Create account: `POST {IDENTITY_URL}/api/account/register` (`name`, `email`, `password`),
  then the same login call.
- The server returns a 30-minute access token (a JWT — `Auth` reads the member from it) and a
  refresh token. Both are kept in `localStorage` (`vitrix.session`); the access token is
  refreshed a minute before it expires, so members stay signed in across visits.
- Server rules: passwords need 8+ characters with upper and lower case, a number and a symbol;
  5 wrong passwords lock the account for 15 minutes. Error texts come from the server.

Pages:

- `/login` — two tabs, **Log in** and **Create account**. Creating an account signs the member
  in straight away; both then go to the `?redirect=` URL or `/account` with a toast ("Account
  created. Welcome…" / "Welcome back…"). Logging out shows "You have been logged out.".
- `/account` and `/apply` — protected by `authGuard` (not signed in → `/login?redirect=...`).
  Apply is pre-filled with the member's name and email.
- Header shows "Log in" or the member's name; mobile menu shows "Log in" / "My account".
- `Auth.accessToken()` gives the Bearer token for calling VITRIX APIs later.
- `Member.courses` is a list of course `id`s from `COURSES`. Nothing fills it yet — that is the
  job of the future purchase flow (an API that validates the identity server's tokens).

**Which server:** on `localhost` the site uses the identity server from docker compose
(`http://localhost:8080`); the published site uses `https://vitrix-identity.onrender.com`
(`PRODUCTION_IDENTITY_URL` in `auth.config.ts`; set it to `''` to switch login off there —
links hidden, pages open). The Render server allows requests from `https://becominggg.github.io`
(CORS, set in identity-api's `render.yaml`). On Render's free plan the server sleeps after 15
minutes idle, so the first login after a quiet period takes about a minute.

### Publishing the site

GitHub Pages serves the `gh-pages` branch. Build with the `/vitrix/` base path and publish the
contents of `dist/vitrix/browser` (plus a copy of `index.html` as `404.html`, so deep links like
`/vitrix/login` work):

```bash
npx ng build --base-href /vitrix/
cp dist/vitrix/browser/index.html dist/vitrix/browser/404.html
# then commit the contents of dist/vitrix/browser to the gh-pages branch
```

### Running locally with login

1. In `identity-api`: `docker compose up --build` (first time: `.\scripts\generate-dev-certs.ps1`).
2. Here: `npm start`, open <http://localhost:4200>. Dev admin: `admin@example.com` / `Admin123!`.

Port 4200 is also used by `identity-web` (the test client); run one of them at a time.

## Roadmap / not done yet

1. ~~Deploy identity-api~~ done (Render + Neon). Consider Render's paid plan so it never sleeps.
2. Course purchase: a "Buy" button on each course → payment (e.g. Stripe Checkout or a Georgian
   bank gateway such as TBC / Bank of Georgia) → webhook writes the enrollment. Payments need a
   server-side piece (provider function / edge function); never trust the browser to mark a
   course as paid.
3. Course content for enrolled students (lessons, materials, schedules) under `/account`.
4. Connect Apply and Contact forms to a real inbox (they currently only show a confirmation).
5. Password reset and email verification (identity-api needs an email sender).
6. Footer year is hard-coded in [src/app/layout/site-footer.ts](src/app/layout/site-footer.ts).

Update this file when you finish a roadmap item or change how something works.
