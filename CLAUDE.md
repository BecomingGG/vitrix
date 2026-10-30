# VITRIX — project notes

VITRIX is a website for an emergency-medicine training institute (Tbilisi, Georgia).
Medical students and clinicians browse courses (ACLS, ATLS, PHTLS, BLS, Critical Care,
Simulation), apply, and — eventually — buy courses and see them in their account.

The site is a **static Angular app** published on **GitHub Pages**. There is **no backend yet**:
forms and login run entirely in the browser.

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
| [src/app/auth.ts](src/app/auth.ts) | `Auth` service (login / register / logout, current user signal) and `authGuard`. |
| [src/app/layout/](src/app/layout/) | Header (nav, search, login link, mobile menu) and footer. |
| [src/app/mark.ts](src/app/mark.ts) | The VITRIX logo as an SVG component. |
| `src/app/pages/*` | One folder per page: home, about, courses, simulation, faculty, partners, contact, apply, login, account. |

## Login (current state)

- `/login` — one page with two tabs: **Log in** and **Create account**. After success it goes to
  the `?redirect=` URL or `/account`.
- `/account` — protected by `authGuard`. Shows name, email, enrolled courses, and Log out.
- Header shows "Log in" or the member's name; mobile menu shows "Log in" / "My account".
- `Member.courses` is a list of course `id`s from `COURSES`. Nothing adds to it yet — that is
  the job of the future purchase flow.

**Demo only:** accounts are saved in the visitor's `localStorage` (passwords are salted SHA-256
hashes, but anyone with the browser can read/change the data). It is not real security and
accounts don't sync between devices.

### Replacing demo auth with a real provider

Keep the public API of `Auth` the same (`user`, `signedIn`, `register`, `login`, `logout`) so the
pages and guard don't need changes. Only rewrite the inside of [src/app/auth.ts](src/app/auth.ts).

Good fits for a static GitHub Pages site (no own server needed):

- **Supabase** — auth + Postgres database. Store enrollments in a `enrollments` table.
- **Firebase** — Firebase Auth + Firestore.

Steps: create the project, put the public client keys in an Angular environment file, replace
`register`/`login`/`logout`/`restore` with the provider's SDK calls, and load
`Member.courses` from the database. Session restore becomes async — set `current` when the
provider reports the signed-in user.

## Roadmap / not done yet

1. Real auth provider (see above).
2. Course purchase: a "Buy" button on each course → payment (e.g. Stripe Checkout or a Georgian
   bank gateway such as TBC / Bank of Georgia) → webhook writes the enrollment. Payments need a
   server-side piece (provider function / edge function); never trust the browser to mark a
   course as paid.
3. Course content for enrolled students (lessons, materials, schedules) under `/account`.
4. Connect Apply and Contact forms to a real inbox (they currently only show a confirmation).
5. Password reset and email verification (come with the real provider).
6. Footer year is hard-coded in [src/app/layout/site-footer.ts](src/app/layout/site-footer.ts).

Update this file when you finish a roadmap item or change how something works.
