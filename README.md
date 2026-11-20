# Report Safi — Title Selection Portal

A student-facing portal and administrator workspace for browsing, selecting and managing
research/project titles — built to the rules in the supplied PRD
(`CBE_Research_Title_Selection_Portal_PRD.md`, PRD v1.0, 19 Nov 2026).

Swahili-first audience, English interface, Tanzanian phone/reg-number formats.

## Run

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run db:setup             # create schema + seed Supabase once
npm run dev                  # http://localhost:5173
npm run build                # production bundle in dist/
npm run lint                 # oxlint
npm run test:rules           # 22 automated checks of the business rules (BR-01 … BR-09)
```

### Supabase

The browser uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` only. The direct
PostgreSQL password is read **only** by `scripts/supabase-setup.mjs` from the server-side
`SUPABASE_DB_URL` variable in `.env.local`. Because the project's direct host is IPv6-only, the
setup script uses the IPv4 session pooler URL (`aws-0-<region>.pooler.supabase.com:5432`).

Data lives in **real tables** — `programmes`, `titles`, `students`, `selections`, `audit_log` and
`admins` — not a JSON blob. All 73,880 generated case-study titles are inserted as individual rows.
The catalog starts with **zero students, zero selections and zero audit entries**; the first
reservation is `RS-TS-2026-00001`.

Reads and writes go through `SECURITY DEFINER` RPCs in `supabase/schema.sql`. The RPCs re-check
BR-01…BR-09 on every reservation and the database adds unique partial indexes that make a single
active selection per student *and* per title impossible to violate. Direct table access is revoked
from the browser, so admin password hashes never reach the client. If the Supabase variables are
absent (or `VITE_DATA_SOURCE=local`), the app falls back to the original local prototype used by
`npm run test:rules` (that offline fixture keeps synthetic history for exercises only).

| Script | Purpose |
|---|---|
| `npm run db:setup` | Create the schema and seed all titles. Safe to re-run; keeps existing data. |
| `npm run db:reset` | Drop and recreate everything, then load the clean 0-selection seed. |

`.env.local` is ignored by Git. Never commit the database password or use a `VITE_` prefix for it.

### Deployment

See **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** for full Vercel and Cloudflare Pages instructions.

- **One Vercel project** serves both apps: `npm run build` → `dist/`.
- Student portal: `https://reportsafi.me` / `https://www.reportsafi.me`.
- Staff workspace: `https://admin.reportsafi.me` — a host-conditioned rewrite in `vercel.json`
  serves the internal `admin.html` at the subdomain root. `/admin.html` is redirected away from the
  student domain, so it is not a public page there.
- The build renames the student entry to `student.html`. Vercel checks the filesystem before
  rewrites, so leaving an `index.html` at `/` would prevent the admin-subdomain rule from running.
- Only three browser-safe variables are needed: `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_DATA_SOURCE=supabase`. Never add `SUPABASE_DB_URL`.

Hash routing (`#/catalogue`, etc.) needs no server rewrite beyond `/`. `public/_redirects` mirrors
the routing for Cloudflare Pages.

### Staff credentials

The staff workspace is deliberately not linked from the student website.

- Local: **`http://localhost:5173/admin.html`** (dev entry only)
- Production: **`https://admin.reportsafi.me/`**

| Role | Username | Password |
|---|---|---|
| Administrator | `neemamndeme37@gmail.com` | `Neema1998?@` |

## Student flow (PRD §5, §8)

1. **`#/` Welcome / student details** — registration number, full names, active phone,
   programme. Stored but explicitly *not* verified against the college register.
2. **`#/catalogue` Title catalogue** — search, availability filter, sort, pagination (20/50/100
   rows). Green = available, red = unavailable, always with a word as well as a colour.
3. **`#/confirm` Confirm selection** — your details against the chosen title, with the one-title
   warning.
4. **`#/reference` Selection confirmation** — reference number (`RS-TS-YYYY-00000`), printable.

Plus **`#/help`** — process, the nine business rules, FAQ.

## Admin workspace (PRD §6)

`https://admin.reportsafi.me/` → `#/` sign-in → Dashboard · Programmes · Title catalogue ·
Selections · Audit log.

- CSV import with a **validation preview** — duplicates, too-short titles and rows already in the
  programme are rejected before anything is committed.
- Export of catalogue, selection records and the audit log as CSV.
- Releasing a selection **requires a reason** (BR-07) and is written to the audit log with the
  actor's name.

## How the rules are enforced (PRD §9, §10, §11)

`src/lib/api.js` selects the backend and exposes one async, validating, typed-error interface.
Every reservation re-reads the store **inside a lock/transaction** and re-checks BR-01…BR-09
immediately before committing, so two simultaneous requests cannot both succeed — the loser is
told the title has just become unavailable.

- `src/lib/supabaseApi.js` — browser client. Every read/write is a Supabase RPC.
- `supabase/schema.sql` — tables, RLS, indexes, `SECURITY DEFINER` RPCs and grants.
- `src/lib/localApi.js` / `src/lib/db.js` — offline fallback with deterministic catalogue
  generation, local lock and cross-tab sync (`BroadcastChannel` + `storage` events).
- The catalogue contains **48 programmes** across Basic Technician Certificate, Ordinary Diploma
  and Bachelor Degree awards, with **73,880 unique Dar es Salaam-focused titles** (1,500+ each).
  Admin additions and edits update the title rows directly.
- Student details and reservations are written to `students` / `selections` and queried by the
  admin dashboard through SQL aggregates — the figures are live, not hardcoded.

> **Security note.** The publishable key is intentional for browser use. Staff sign-in is still a
> prototype credential store; replace it with Supabase Auth or another production-grade identity
> provider before public launch.

## Structure

```
src/
  main.jsx              student app entry (index.html)
  admin-main.jsx        staff app entry (admin.html)
  App.jsx               student route table, session guards, cross-tab refresh
  AdminApp.jsx          separate staff route table and auth guard
  index.css             design system (dark ink/ochre, serif headings, mono records)
  lib/                  router · api (backend selector) · supabaseApi · localApi ·
                        db (offline fallback) · errors · scroll · toast · utils
  ui/                   icons (inline SVG) · primitives (Btn, Modal, Pager, tags…)
  components/           site header & footer, PageIntro, SelectionRecord, WhatsApp button
  sections/             content blocks: LogoCloud, Features, Showcase,
                        WhySafi, Pricing, Security, CtaBand
  pages/                Welcome (home), Catalogue, Features, Pricing, Security,
                        Confirm, Reference, Help
  pages/admin/          Login, AdminShell, Dashboard, Programmes, Titles, Selections, Audit

vite.config.js          main build (dist/) — student + staff entries
vite.admin.config.js    optional standalone admin build (dist-admin/index.html)
vercel.json             one Vercel project: host rewrite at / (student.html / admin.html)
DEPLOYMENT-GUIDE.md     Vercel + Cloudflare domain/DNS setup
supabase/
  schema.sql            normalized tables, RPCs, RLS and grants
scripts/
  supabase-setup.mjs    schema creation + seed all 73,880 titles (0 selections)
  smoke.mjs             business-rule checks
_legacy/                the previous "Report Safi" site, kept for reference
```

## Not in this release (per PRD §3.2)

Payments, supervisor approval, native apps, automatic verification against the official student
register.
