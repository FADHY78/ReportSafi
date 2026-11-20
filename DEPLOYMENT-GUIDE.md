# Deployment & domain guide

This repository builds two separate apps:

| App | Public URL | Build command | Output |
| --- | --- | --- | --- |
| Student portal | `https://reportsafi.me` / `https://www.reportsafi.me` | `npm run build` | `dist/` |
| Staff workspace | `https://admin.reportsafi.me` | `npm run build:admin` | `dist-admin/` |

The student build contains **only `index.html`** — `/admin.html` is no longer part of the public
site. The admin build turns `admin.html` into `dist-admin/index.html`, so it is served directly at
the subdomain root. Both apps use hash routes, so no SPA fallback rewrite is needed.

---

## 1. Environment variables (both apps)

Add exactly these three variables to **every deployment**:

| Name | Example value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://cgxabxcralfulzredfjj.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` |
| `VITE_DATA_SOURCE` | `supabase` |

Do **not** add `SUPABASE_DB_URL`, the PostgreSQL password, or any `VITE_` variable containing a
secret. The schema is seeded locally with `npm run db:setup` / `npm run db:reset`; hosting only
needs the browser-safe publishable key.

---

## 2. Vercel — two projects

Because the two apps have different build commands and outputs, use **two Vercel projects** from the
same GitHub repository.

> `vercel.json` intentionally does **not** pin `buildCommand` / `outputDirectory`, so each project
> uses its own dashboard settings. It only keeps the legacy `/admin.html` redirect.

### Project A — student portal

| Setting | Value |
| --- | --- |
| Framework preset | Vite (auto-detected) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | repository root |
| Custom domains | `reportsafi.me`, `www.reportsafi.me` |

### Project B — staff workspace

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | **`npm run build:admin`** |
| Output directory | **`dist-admin`** |
| Root directory | repository root |
| Custom domain | `admin.reportsafi.me` |

`vite.admin.config.js` renames `admin.html` to `dist-admin/index.html`, so
`https://admin.reportsafi.me/` serves the staff login directly. `/admin.html` does not exist in
this deployment either.

### DNS (Cloudflare as DNS provider)

Vercel will give you the exact records to add when you attach each domain. Typically:

| Type | Name | Value | Proxy |
| --- | --- | --- | --- |
| `A` | `reportsafi.me` | `76.76.21.21` | DNS only (grey cloud) |
| `CNAME` | `www` | `cname.vercel-dns.com` | DNS only (grey cloud) |
| `CNAME` | `admin` | `cname.vercel-dns.com` (or the value Vercel shows) | DNS only (grey cloud) |

Leave the orange cloud **off** for Vercel records.

### Verify on Vercel

```bash
curl -I https://reportsafi.me/admin.html
# HTTP/2 301 → location: https://admin.reportsafi.me/

curl -s https://reportsafi.me/ | grep -i "Research Title Selection Portal"
curl -s https://reportsafi.me/admin.html | grep -i "Staff Workspace"   # should be empty

curl -s https://admin.reportsafi.me/ | grep -i "Staff Workspace"
curl -s https://admin.reportsafi.me/admin.html | grep -i "Staff Workspace"   # should be empty
```

Every deployment must be **Ready** on commit `fe840d7` or later. Older deployments still serve
`/admin.html` on the student domain and the student site on the admin subdomain.

---

## 3. Cloudflare Pages (alternative)

If you prefer Pages instead of Vercel, use two Pages projects. `_redirects` cannot match on
hostname, so a single project cannot serve two subdomains.

### Project A — student portal

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | repository root |
| Custom domains | `reportsafi.me`, `www.reportsafi.me` |

### Project B — admin subdomain

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build:admin` |
| Build output directory | `dist-admin` |
| Root directory | repository root |
| Custom domain | `admin.reportsafi.me` |

### Cloudflare DNS

- If `reportsafi.me` is a Cloudflare zone, adding the custom domain in Pages creates the DNS
  records automatically.
- For the `admin` subdomain, accept the automatic CNAME or add it manually:

  | Type | Name | Value |
  | --- | --- | --- |
  | `CNAME` | `admin` | `<your-admin-pages-project>.pages.dev` |

- Do not create the CNAME manually before associating the domain in Pages; use **Custom domains →
  Set up a domain** so Cloudflare issues the certificate correctly.

`public/_redirects` is copied into both builds. On the student project it redirects the old
`/admin.html` URL to the admin subdomain. On the admin project it is harmless.

---

## 4. Local checks before deploying

```bash
npm run lint
npm run build
npm run build:admin
npm run test:rules
```

Expected:

- `dist/index.html` only from the main build (no `dist/admin.html`).
- `dist-admin/index.html` from the admin build (no `dist-admin/admin.html`).
- `npm run test:rules` still passes (it uses the offline fixture, not live data).

For local development, `http://localhost:5173/admin.html` still works — Vite's dev server serves
any HTML file at the root.

---

## 5. Security notes

- The admin page already sets `<meta name="robots" content="noindex, nofollow">`.
- For production, add an extra access layer: **Vercel Password Protection** or **Cloudflare
  Access** on `admin.reportsafi.me`.
- Keep `SUPABASE_DB_URL` only in your local `.env.local`. Never add it to Vercel or Cloudflare.
- Staff sign-in is a prototype credential store. Replace it with a real identity provider before
  public launch.
