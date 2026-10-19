export const routes = {
  home: "/",
  createInvoice: "/create-invoice",
  invoicePreview: "/invoice-preview",
  /** Template gallery (Phase 3); redirects to builder until then */
  templates: "/templates",
  features: "/features",
  /** @deprecated Redirects to home until a paid plan exists */
  pricing: "/pricing",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  onboarding: "/onboarding",
  /** @deprecated Permanent redirect to /invoices (History) */
  dashboard: "/dashboard",
  /** Saved invoice history (UI label: History) */
  invoices: "/invoices",
  invoicesNew: "/invoices/new",
  invoice: (id: string) => `/invoices/${id}`,
  invoiceEdit: (id: string) => `/invoices/${id}/edit`,
  invoicePdf: (id: string) => `/invoices/${id}/pdf`,
  publicInvoice: (token: string) => `/i/${token}`,
  /** @deprecated Permanent redirect to /invoices */
  services: "/services",
  servicesNew: "/services/new",
  service: (id: string) => `/services/${id}`,
  tools: "/tools",
  tool: (slug: string) => `/tools/${slug}`,
  settings: "/settings",
  settingsBusiness: "/settings/business",
  settingsInvoices: "/settings/invoices",
  settingsBranding: "/settings/branding",
  settingsPayments: "/settings/payments",
  settingsSecurity: "/settings/security",
  pay: (invoiceId: string) => `/pay/${invoiceId}`,
} as const;

export const publicRoutes = [
  routes.home,
  routes.createInvoice,
  routes.invoicePreview,
  routes.features,
  routes.privacy,
  routes.terms,
  routes.cookies,
  routes.tools,
  routes.login,
  routes.signup,
  routes.forgotPassword,
] as const;

export const authRoutes = [
  routes.login,
  routes.signup,
  routes.forgotPassword,
] as const;

/** Account-only surfaces: History (/invoices), settings, onboarding. */
export const protectedRoutes = [
  routes.onboarding,
  routes.invoices,
  routes.settings,
] as const;

export const SESSION_COOKIE_NAME = "__session";
