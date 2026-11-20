# Deployment & domain guide

## Recommended: one Vercel project

Both apps are served from a **single Vercel deployment**. No second project and no separate build
is needed.

| URL | What is served | How |
| --- | --- | --- |
| `https://reportsafi.me` / `https://www.reportsafi.me` | Student portal | `dist/index.html` |
| `https://admin.reportsafi.me/` | Staff workspace | host rewrite → internal `dist/admin.html` |

`vercel.json` contains the whole setup:

- `npm run build` → `dist/` (builds both `index.html` and `admin.html`).
- `/admin.html` on the two student hosts → `301` to `https://admin.reportsafi.me/`.
- `/` on host `admin.reportsafi.me` → internally rewritten to `/admin.html`.

The address bar stays `https://admin.reportsafi.me/` — visitors never see `/admin.html`. The admin
app uses hash routes (`#/dashboard`, `#/ selections`, …), so the browser only ever requests `/`; a
single root rewrite is enough and assets keep loading normally from `/assets/`.

---

### 1. Environment variables

Add exactly these three variables to **Production, Preview and Development** in the one project:

| Name | Example value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://cgxabxcralfulzredfjj.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` |
| `VITE_DATA_SOURCE` | `supabase` |

Do **not** add `SUPABASE_DB_URL`, the PostgreSQL password, or any `VITE_` variable containing a
secret. The schema is seeded locally with `npm run db:setup` / `npm run db:reset`; hosting only
needs the browser-safe publishable key.

---

### 2. Domains

In **Vercel → Project Settings → Domains**, add all three:

- `reportsafi.me`
- `www.reportsafi.me`
- `admin.reportsafi.me`

The host rewrite is only active for hostnames attached to that project. You have already added the
subdomain and applied the DNS records Vercel supplied, so this part is done. Keep the Cloudflare
`admin` record **grey cloud / DNS only**:

```text
CNAME  admin  →  cname.vercel-dns.com   (or the exact target Vercel shows)
```

---

### 3. Deploy the latest commit

The earlier problem was an **old deployment** still being served — its asset filenames did not
match the current build. After pushing the rewrite rules, Vercel must build and promote a new
deployment.

1. Open the project → **Deployments**.
2. Find the deployment for commit `7ca8651` or later.
3. Click **Redeploy** or **Promote to Production**.
4. Wait until it shows **Ready**.

If GitHub auto-deploy is not connected, run from the repo root:

```bash
npx vercel login
npx vercel --prod
```

---

### 4. Verify

```bash
curl -I https://reportsafi.me/admin.html
# HTTP/2 301 → location: https://admin.reportsafi.me/

curl -s https://admin.reportsafi.me/ | grep -i "Staff Workspace"
curl -s https://www.reportsafi.me/ | grep -i "Research Title Selection Portal"

# the admin subdomain must load real JS assets, not the admin HTML for every file
curl -s https://admin.reportsafi.me/ | grep -o '/assets/[^"]*\.js' | head -1
```

Expected:

- The subdomain title is **Report Safi — Staff Workspace**.
- The main domain title is **Report Safi — Research Title Selection Portal**.
- `/admin.html` on the main domain redirects to the subdomain.
- The asset URL returns JavaScript, not HTML.

If the subdomain still shows the student site, the live deployment is stale or
`admin.reportsafi.me` is not attached to the project.

---

## Optional: Cloudflare Pages instead of Vercel

Cloudflare's `_redirects` cannot match on hostname, so Pages needs **two projects** from the same
repository. Skip this section if you are using Vercel.

| Project | Build command | Output | Domain |
| --- | --- | --- | --- |
| Student portal | `npm run build` | `dist` | `reportsafi.me`, `www.reportsafi.me` |
| Staff workspace | `npm run build:admin` | `dist-admin` | `admin.reportsafi.me` |

`vite.admin.config.js` builds `admin.html` as `dist-admin/index.html`. Add the custom domain in
Pages first, then accept the CNAME it creates (`admin → <project>.pages.dev`).

`public/_redirects` redirects the old `/admin.html` URL to the admin subdomain on the student
project.

---

## Local checks

```bash
npm run lint
npm run build
npm run build:admin
npm run test:rules
```

- `dist/` contains both `index.html` and `admin.html` (the latter is only an internal rewrite
  target, not a public page on the student domain).
- `dist-admin/index.html` exists for the optional Pages deployment.
- `npm run test:rules` passes 22/22.
- `http://localhost:5173/admin.html` still works in the Vite dev server.

---

## Security notes

- The admin page sets `<meta name="robots" content="noindex, nofollow">`.
- Add **Vercel Password Protection** or **Cloudflare Access** on `admin.reportsafi.me` for
  production.
- Keep `SUPABASE_DB_URL` only in local `.env.local`. Never add it to Vercel or Cloudflare.
- Staff sign-in is a prototype credential store; replace it with a real identity provider before
  public launch.
