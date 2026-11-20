# Deployment & domain guide

This project serves two apps from one repository:

| App | Public URL | Build command | Output |
| --- | --- | --- | --- |
| Student portal | `https://reportsafi.me` / `https://www.reportsafi.me` | `npm run build` | `dist/` |
| Staff workspace | `https://admin.reportsafi.me` | `npm run build:admin` | `dist-admin/` |

The student app uses hash routes (`#/catalogue`, `#/help`, …), so no SPA fallback rewrite is
needed. The admin app is a separate Vite entry (`admin.html`); the dedicated build makes it the
root page of the admin subdomain.

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

## 2. Vercel

The committed `vercel.json` already contains the routing rules:

- `reportsafi.me/admin.html` and `www.reportsafi.me/admin.html` → `301` to
  `https://admin.reportsafi.me/`.
- `admin.reportsafi.me/*` → internally rewritten to `/admin.html` (assets, favicon and
  `robots.txt` are excluded so they keep loading normally).

### One project, three domains

1. Import `https://github.com/FADHY78/ReportSafi.git` as a Vite project.
2. Keep the detected settings from `vercel.json` (`npm run build`, output `dist/`).
3. Add the three environment variables above to Production, Preview and Development.
4. Go to **Project Settings → Domains** and add:
   - `reportsafi.me`
   - `www.reportsafi.me`
   - `admin.reportsafi.me`

   The `has: [{ "type": "host", "value": "admin.reportsafi.me" }]` rewrite only matches when that
   hostname is attached to the project, so this step is required.

5. In your DNS provider (or Cloudflare DNS), add:

   | Type | Name | Value | Proxy |
   | --- | --- | --- | --- |
   | `A` | `reportsafi.me` | `76.76.21.21` | DNS only (grey cloud) |
   | `CNAME` | `www` | `cname.vercel-dns.com` | DNS only (grey cloud) |
   | `CNAME` | `admin` | `cname.vercel-dns.com` | DNS only (grey cloud) |

   If Cloudflare is your DNS provider for Vercel, leave the orange cloud **off** for these records.

6. Deploy (`git push` or `npx vercel --prod`).

### Verify on Vercel

```bash
curl -I https://reportsafi.me/admin.html
# HTTP/2 301 → location: https://admin.reportsafi.me/

curl -s https://admin.reportsafi.me/ | grep -i "Staff Workspace"
curl -s https://admin.reportsafi.me/ | grep -o '/assets/[^"]*\.js' | head -1
```

The last command must return a real asset path. If it returns `admin.html` markup for an asset
request, the host rewrite is too broad — keep the `assets/` and `favicon.svg` exclusions.

---

## 3. Cloudflare Pages

Cloudflare's `_redirects` file cannot match on hostname, so the cleanest setup is **two Pages
projects** from the same repository.

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

`vite.admin.config.js` builds `admin.html` and renames it to `dist-admin/index.html`, so
`https://admin.reportsafi.me/` serves the staff workspace directly.

### Cloudflare DNS

- If `reportsafi.me` is a Cloudflare zone, adding the custom domain in Pages creates the DNS
  records automatically.
- For the `admin` subdomain, accept the automatic CNAME or add it manually:

  | Type | Name | Value |
  | --- | --- | --- |
  | `CNAME` | `admin` | `<your-admin-pages-project>.pages.dev` |

- An apex domain (`reportsafi.me`) requires the zone to be on Cloudflare.
- Do not create the CNAME manually in the Pages dashboard first; always use **Custom domains →
  Set up a domain** so Cloudflare issues the certificate correctly.

`public/_redirects` is copied into both builds. On the student project it redirects the old
`/admin.html` URL to the admin subdomain. On the admin project it is harmless.

### Verify on Cloudflare

```bash
npm run build:admin
# dist-admin/index.html must exist and contain "Staff Workspace"

curl -I https://reportsafi.me/admin.html
# HTTP/2 301 → location: https://admin.reportsafi.me/

curl -s https://admin.reportsafi.me/ | grep -i "Staff Workspace"
```

---

## 4. Local checks before deploying

```bash
npm run lint
npm run build
npm run build:admin
npm run test:rules
```

Expected:

- `dist/index.html` and `dist/admin.html` from the main build.
- `dist-admin/index.html` from the admin build.
- `npm run test:rules` still passes (it uses the offline fixture, not live data).

---

## 5. Security notes

- The admin page already sets `<meta name="robots" content="noindex, nofollow">`.
- For production, add an extra access layer: **Vercel Password Protection** or **Cloudflare
  Access** on `admin.reportsafi.me`.
- Keep `SUPABASE_DB_URL` only in your local `.env.local`. Never add it to Vercel or Cloudflare.
- Replace the demo admin password (`Report@2026`) with a real identity provider before public
  launch.
