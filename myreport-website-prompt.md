# MyReport — Website Build Prompt

Use this as a single, complete prompt for a developer, no-code builder, or AI page-generation tool (v0, Cursor, Lovable, etc.) to build the site.

---

## 1. Project Overview

Build a website called **MyReport** for a Dar es Salaam-based business that writes, prints, and delivers **Field Reports** and **Research Reports/Proposals** for university and college students in Tanzania. The site should feel like an **online booking system**: students pick their Faculty → Course → then browse a list of Research Report Titles, where each title shows a color-coded status. It must look professional, trustworthy, and visually striking — matching the brand's promotional flyer style.

**Primary audience:** University/college students in Dar es Salaam (e.g. UDSM, DIT, TIA, CBE, DMI, MUHAS, Mzumbe, IFM, Ardhi, SAUT).
**Language:** Bilingual — Swahili primary, English secondary (toggle or side-by-side key phrases).
**Tone:** Fast, affordable, professional, "we save your time."

---

## 2. Brand Colors (extracted from existing flyer)

| Role | Color | Hex |
|---|---|---|
| Primary Navy (headers, banners, nav bar) | Deep Navy Blue | `#12395F` |
| Secondary Navy (darker panels) | Darker Navy | `#0B2A47` |
| Accent Gold/Orange (CTAs, highlights, banners) | Warm Gold | `#F5A623` |
| Accent Red (offers, urgency, "approved" status) | Bold Red | `#E32227` |
| Success/Available Green | Fresh Green | `#2FA84F` |
| Neutral background | Off-white | `#FAFAFA` |
| Text | Charcoal | `#1A1A1A` |
| Logo gradient (use sparingly, for logo/icon only) | Pink→Purple→Orange gradient | `#E8459C → #7A3FA0 → #F5A623` |

Use gold as the dominant CTA/accent color, navy for structure and trust, red only for urgent/offer badges and the "approved" status tag, green for "available" status.

---

## 3. Typography & Visual Style

- Headings: bold, rounded, condensed sans-serif (like Poppins ExtraBold / Montserrat Black) — big, punchy numbers and titles like on the flyer.
- Body: clean sans-serif (Inter, Nunito, or Open Sans) for readability in Swahili.
- Use diagonal/triangular banner shapes, badge/ribbon "SPECIAL OFFER"-style elements, and circular checkmark icons (gold circle + white check) as recurring UI motifs.
- Card-based layouts with soft shadows, rounded corners (12–16px), and a spiral-bound "notebook" illustration motif for report mockups (hero section).
- Fully responsive: mobile-first (most students will browse via phone/WhatsApp), then tablet/desktop.

---

## 4. Site Structure / Pages

1. **Home**
   - Hero: headline "Field Report & Research Report Kwa Bei Nafuu" + price banner style (like flyer's "20,000/=") + CTA button "Anza Kutafuta Ripoti Yako" (Start Booking)
   - Trust badges row: university/college logos (UDSM, DIT, TIA, CBE, etc.)
   - "Why choose us" 4-point checklist (Okoa Muda, Huduma Rahisi, Tayari Kuwasilishwa, Imeandaliwa Kitaalamu) — gold circular check icons on navy background, exactly like the flyer.
   - How it works (3–4 steps): Chagua Kitivo → Chagua Kozi → Chagua/Order Mada → Lipa na Pokea
   - Testimonials carousel
   - Sticky WhatsApp button (bottom right, green WhatsApp icon) linking to +255613328915
   - Footer with logo, contact, social, partner institution logos

2. **Booking / Course Selector (core feature — see Section 5)**

3. **Report Title Detail Page** — title, abstract/summary, faculty, course, price, "Order This Title" button, related titles

4. **Field Report Ordering Page** — simpler flow: select institution + programme + fill student details (Name, Reg No, Programme, Academic Year) → submit request → WhatsApp/payment confirmation

5. **About Us**

6. **Pricing** — clear price cards (Field Report 20,000/=, Research Report Proposal, Full Research Report, etc. — placeholders, editable)

7. **Contact** — WhatsApp, phone, website form, map (Dar es Salaam)

8. **Admin/Dashboard (backend, simple)** — to add/edit courses, faculties, and report titles, and to change a title's status (Available/Selected/Approved)

---

## 5. Core Feature: Faculty → Course → Report Title Selector

This is the most important interactive feature — build it like a booking flow:

**Step 1 — Select Faculty**
Grid/dropdown of faculties (e.g. Business, Engineering, Education, Health Sciences, IT/Computer Science, Law, Social Sciences, Accounting & Finance, Marine Sciences, etc.)

**Step 2 — Select Course**
Once faculty is chosen, show a filtered list/dropdown of courses under that faculty (e.g. under Business: Accounting, Marketing, Procurement, Human Resource Management).

**Step 3 — Browse Report Titles**
Show a scrollable/grid list of research report titles under the chosen course. Each title is a card/pill with a **color status system**:

| Color | Status | Meaning | Interaction |
|---|---|---|---|
| 🟢 Green | Available | Not yet selected by anyone | Clickable — click to select |
| 🟡 Yellow | Selected | Currently selected by the browsing student (in their cart, not yet confirmed) | Click again to deselect |
| 🔴 Red | Approved/Taken | Already booked & approved for another student — locked | Not clickable, shown as disabled/greyed with red tag |

Behavior:
- Default state of every title = green.
- When a student clicks a title, it turns yellow and is added to a "selection tray" (like a cart) shown as a floating panel/sidebar with count.
- Titles that are already taken by other confirmed orders load as red from the database and cannot be selected.
- Student can select multiple titles (yellow), review them in the tray, then click **"Endelea na Order"** (Proceed to Order).
- On checkout, student fills in Name, Registration Number, Institution, Phone/WhatsApp Number, and confirms.
- After submission, status updates to Red (Approved) in the database and admin gets notified (email/WhatsApp/Telegram webhook).
- Add a small legend/key near the list explaining the 3 colors (icons + labels) so it's always clear to users.

Include filters/search bar above the list: search by keyword, filter by academic year, sort A–Z.

---

## 6. Functional/Technical Requirements

- **Frontend:** React (Next.js) or plain HTML/Tailwind CSS — component-based, reusable Card, Badge, Modal, Stepper components.
- **Backend/DB:** Node.js/Express or Next.js API routes + PostgreSQL/MySQL/Firebase — tables for `faculties`, `courses`, `report_titles` (with `status` enum: available/selected/approved), `orders`, `students`.
- **Real-time status:** Use polling or websockets (or Firebase real-time DB) so if two students view the same title, the color updates live to avoid double-booking conflicts.
- **Payment integration:** placeholder for mobile money (M-Pesa/Tigo Pesa/Airtel Money) manual confirmation flow, or integrate a local payment gateway (Selcom, ClickPesa) — show account/paybill details + "I've Paid" confirm button + WhatsApp proof upload.
- **Notifications:** WhatsApp click-to-chat links prefilled with the selected title(s) and student info; optional email confirmation.
- **Admin dashboard:** simple CRUD to manage faculties, courses, titles, and change statuses; view all orders.
- **SEO:** meta tags targeting "field report Dar es Salaam", "research report writing Tanzania", "mada za utafiti", etc.
- **Performance:** optimized images, lazy loading for long title lists, fast mobile load (students often on limited data).
- **Accessibility:** color status must also include text/icon labels (not color alone) for colorblind users.

---

## 7. Content/Copy to Include (Swahili primary)

- Hero tagline: "Tunaandaa Field Report na Research Report kwa Ubora wa Kitaalamu"
- Value props: Okoa Muda • Huduma Rahisi • Tayari Kuwasilishwa • Imeandaliwa Kitaalamu
- CTA buttons: "Chagua Mada Yako", "Order Sasa", "Wasiliana Nasi"
- Contact: WhatsApp +255613328915, website www.reportsafi.com (adjust to actual MyReport domain)
- Partner/served institutions row: TIA, CBE, DIT, and other Dar es Salaam colleges (use real logos with permission)

---

## 8. Deliverables Requested from Builder

1. Fully responsive homepage matching brand colors/style above
2. Working Faculty → Course → Report Title booking flow with the 3-color status system
3. Admin panel to manage titles/status
4. Field report simple order form
5. WhatsApp integration
6. Clean, modern, "stunning" visual polish — generous whitespace, bold gold/navy contrast, notebook/report mockup imagery, subtle animations on hover/select (e.g. card lift + color transition when a title turns yellow)

---

*Note: paste this whole prompt into your builder/developer tool as-is. Replace placeholder phone numbers, institution names, and pricing with your actual current details before publishing.*
