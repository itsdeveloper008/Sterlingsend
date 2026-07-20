# Valix Invoice — Implementation Roadmap

Ordered by dependency and business value. Each epic should be shippable.

---

## Epic 1 — Foundation (COMPLETE)

**Goal:** Runnable production scaffold

- [x] Next.js 15 + TypeScript + Tailwind + shadcn/ui
- [x] Route groups: public, auth, dashboard, payment
- [x] Firebase client + admin architecture
- [x] Domain types + Firestore schema design
- [x] Server services layer
- [x] Session cookie auth API
- [x] Middleware protected routes
- [x] Dashboard shell (sidebar, header, mobile nav)
- [x] Auth UI (login, signup, forgot password)
- [x] `.env.example`, Firestore rules + indexes
- [x] Stripe webhook stub

---

## Epic 2 — User onboarding & business profile

**Goal:** New user → business ready in <5 minutes

1. Firebase Auth trigger / signup hook → create `users` doc
2. Onboarding wizard (3 steps): business, invoice defaults, optional Stripe
3. `businesses` + `settings` doc creation
4. Logo upload to Firebase Storage
5. Redirect guards: incomplete onboarding → `/onboarding`
6. Server action: `completeOnboarding`

**Files:** `features/settings/`, `actions/onboarding.actions.ts`, `app/(dashboard)/onboarding/`

---

## Epic 3 — Guest mode (acquisition)

**Goal:** Invoice in <3 minutes without account

1. Full `GuestInvoiceEditor` with live preview
2. UK defaults (GBP, 20% VAT, Net 30)
3. PDF export (client-side, shared util)
4. Print stylesheet
5. localStorage persistence (`lib/guest/draft-storage.ts`)
6. Share: email, WhatsApp, copy
7. SEO metadata + structured data on `/`
8. Guest → signup draft migration

**Files:** `features/invoices/components/`, `lib/pdf/`

---

## Epic 4 — Customers

**Goal:** Reusable client directory

1. Customer list with search
2. Create / edit / soft-delete
3. Customer picker on invoice form (typeahead)
4. Firestore indexes verified
5. Server actions for CRUD

**Files:** `features/customers/`, `actions/customer.actions.ts`

---

## Epic 5 — Invoices (core product)

**Goal:** Create → send → track

1. Invoice editor with live preview
2. Line items + VAT calculations (`lib/invoice/calculations.ts`)
3. Server-side invoice numbering
4. Status lifecycle: draft → sent → viewed → paid → overdue
5. Invoice list with filters + pagination
6. Duplicate invoice
7. Share sheet: PDF, payment link, email

**Files:** `features/invoices/`, `actions/invoice.actions.ts`

---

## Epic 6 — Stripe payments

**Goal:** Get paid online

1. Stripe Connect Express onboarding
2. Public `/pay/[invoiceId]` with PaymentElement
3. Server-side PaymentIntent creation
4. Webhook: `payment_intent.succeeded` → invoice `paid`
5. Payment link copy in share UI
6. Bank transfer fallback when Stripe not connected
7. Settings → payments dashboard

**Files:** `features/payments/`, `app/api/payments/`, `lib/stripe/`

---

## Epic 7 — Saved services & settings

**Goal:** Faster repeat invoicing

1. Saved services CRUD
2. Product picker on invoice editor
3. Settings pages: business, invoices, branding, security
4. Default notes, prefix, payment terms
5. Password change

---

## Epic 8 — Dashboard analytics

**Goal:** At-a-glance business health

1. Summary cards (total, paid, pending, overdue)
2. Recent invoices table (live data)
3. Overdue cron / scheduled function
4. Empty states + loading skeletons

---

## Epic 9 — PDF & email (production hardening)

1. Server-side PDF generation API
2. Resend email integration
3. Invoice send from Valix (not mailto)
4. Payment confirmation emails

---

## Epic 10 — Compliance & launch

1. GDPR export / delete account
2. Cookie consent
3. Privacy / terms pages
4. E2E tests (auth, invoice, payment)
5. Sentry + GA4 events
6. Performance audit (Core Web Vitals)
7. Security review (Firestore rules, API auth)

---

## Suggested sprint mapping

| Sprint | Epics |
|--------|-------|
| 1 | Epic 1 ✅ |
| 2 | Epic 2 |
| 3 | Epic 3 |
| 4 | Epic 4 + 5 (partial) |
| 5 | Epic 5 (complete) |
| 6 | Epic 6 |
| 7 | Epic 7 + 8 |
| 8 | Epic 9 + 10 |
