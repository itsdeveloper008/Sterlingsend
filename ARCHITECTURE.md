# Valix Invoice — Architecture

## Step 1 — Analysis & Decisions

### Architecture risks

| Risk | Mitigation |
|------|------------|
| Firestore relational queries (dashboard aggregates) | Server-side services + composite indexes; denormalised totals on invoices |
| Client-side Firestore access bypassing business rules | Sensitive writes via server actions/API routes; Security Rules as backstop |
| Firebase session cookies on Vercel | HttpOnly `__session` cookie via Admin SDK `createSessionCookie` |
| Stripe webhooks missing payments | Idempotent webhook handler + reconciliation job (Epic 6) |
| Guest mode data loss | localStorage draft + migration on signup |
| Multi-tenant data leaks | `businessId` on all tenant documents + RLS-style Firestore rules |

### Scalability considerations

- **Flat top-level collections** with `businessId` indexes — scales to millions of documents; avoids deep subcollection query limits
- **Denormalised client fields** on invoices — fast PDF/payment pages without joins
- **Server-only services** — `services/*.service.ts` use Firebase Admin for trusted writes
- **Pagination** — all list endpoints use `limit` + cursor (to be wired in Epic 4–5)
- **Storage CDN** — logos in Firebase Storage, not Firestore
- **Edge middleware** — auth gate without cold-starting Admin SDK

### Key decisions

1. **Next.js 15 App Router** with route groups: `(public)`, `(auth)`, `(dashboard)`, `(payment)`
2. **Firebase session cookies** instead of client-only auth state for protected routes
3. **Feature-based modules** under `features/` — colocate UI; `services/` for server data access
4. **TypeScript domain models** in `types/` — single source of truth
5. **shadcn/ui** for accessible, composable design system

---

## Step 2 — Folder structure

```
valix-invoice/
├── app/
│   ├── (public)/                 # Guest + marketing
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── features/page.tsx
│   │   └── pricing/page.tsx
│   ├── (auth)/                   # Login, signup, forgot password
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/              # Protected application
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── invoices/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── services/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── business/page.tsx
│   │       ├── invoices/page.tsx
│   │       ├── branding/page.tsx
│   │       ├── payments/page.tsx
│   │       └── security/page.tsx
│   ├── (payment)/                # Public client payment
│   │   ├── layout.tsx
│   │   └── pay/[invoiceId]/page.tsx
│   ├── api/
│   │   ├── auth/session/route.ts
│   │   └── webhooks/stripe/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn primitives
│   ├── layouts/                  # Public, auth, dashboard, payment shells
│   ├── dashboard/                # Sidebar, header, nav, breadcrumbs
│   └── shared/                   # Cross-feature components
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── customers/
│   ├── invoices/
│   ├── payments/
│   └── settings/
├── lib/
│   ├── guest/
│   ├── invoice/
│   ├── stripe/
│   ├── firestore-utils.ts
│   └── utils.ts
├── hooks/
├── types/
├── services/                     # Server-only Firestore access
├── firebase/
│   ├── client.ts
│   ├── admin.ts
│   ├── auth.ts
│   ├── firestore.ts
│   ├── storage.ts
│   ├── session.ts
│   ├── collections.ts
│   ├── firestore.rules
│   └── firestore.indexes.json
├── actions/
├── providers/
├── config/
├── middleware.ts
├── .env.example
├── ARCHITECTURE.md
└── ROADMAP.md
```

---

## Step 6 — Firestore schema

```
users/{userId}
  email, displayName, businessId, onboardingComplete

businesses/{businessId}
  ownerId, name, email, address, currency, stripeAccountId, ...

customers/{customerId}
  businessId, name, email, address, deletedAt

invoices/{invoiceId}
  businessId, customerId?, status, items[], totals, clientName, ...

payments/{paymentId}
  businessId, invoiceId, stripePaymentIntentId, status, amount

savedServices/{serviceId}
  businessId, name, unitPrice, vatApplicable, deletedAt

settings/{businessId}               # doc id === businessId
  invoice{}, branding{}, notifications{}
```

### Relationships

- `users.businessId` → `businesses.id`
- `businesses.ownerId` → `users.id` (Firebase Auth UID)
- `customers.businessId` → `businesses.id`
- `invoices.businessId` → `businesses.id`
- `invoices.customerId` → `customers.id` (optional)
- `payments.invoiceId` → `invoices.id`
- `settings` document ID = `businessId`

---

## Step 30 — System diagram

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Browser   │────▶│  Vercel / Next   │────▶│  Firebase   │
│  (Guest +   │     │  App Router +    │     │  Auth       │
│   Account)  │     │  API Routes      │     │  Firestore  │
└─────────────┘     └────────┬─────────┘     │  Storage    │
                             │               └─────────────┘
                             ▼
                      ┌─────────────┐
                      │   Stripe    │
                      │  Connect +  │
                      │  Webhooks   │
                      └─────────────┘
```

---

## Auth flow

```
1. Client: Firebase signIn/signUp
2. Client: POST /api/auth/session { idToken }
3. Server: createSessionCookie → Set httpOnly __session
4. Middleware: checks __session on protected routes
5. Server Components: getServerSession() → load user/business
6. Logout: DELETE /api/auth/session + Firebase signOut
```
