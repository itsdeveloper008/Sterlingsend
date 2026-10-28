export const routes = {
  home: "/",
  createInvoice: "/create-invoice",
  invoicePreview: "/invoice-preview",
  templates: "/templates",
  features: "/features",
  /** @deprecated Redirects to home until a paid plan exists */
  pricing: "/pricing",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
  guideUkInvoice: "/guides/what-must-be-on-a-uk-invoice",
  calcVat: "/calculators/vat",
  calcLateInterest: "/calculators/late-payment-interest",
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
  /** PDF tool results the user chose to keep (UI label: Saved files) */
  files: "/files",
  publicInvoice: (token: string) => `/i/${token}`,
  /** @deprecated Permanent redirect to /invoices */
  services: "/services",
  servicesNew: "/services/new",
  service: (id: string) => `/services/${id}`,
  tools: "/tools",
  tool: (slug: string) => `/tools/${slug}`,
  account: "/account",
  admin: "/admin",
  adminLogin: "/admin/login",
  /** @deprecated 308 → /account */
  settings: "/settings",
  /** @deprecated 308 → /account */
  settingsBusiness: "/settings/business",
  /** @deprecated 308 → /account */
  settingsInvoices: "/settings/invoices",
  /** @deprecated 308 → /account */
  settingsBranding: "/settings/branding",
  /** @deprecated 308 → /account */
  settingsPayments: "/settings/payments",
  /** @deprecated 308 → /account */
  settingsSecurity: "/settings/security",
  pay: (invoiceId: string) => `/pay/${invoiceId}`,
} as const;

export const publicRoutes = [
  routes.home,
  routes.createInvoice,
  routes.templates,
  routes.invoicePreview,
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
  routes.files,
  routes.account,
  routes.settings,
] as const;

export const SESSION_COOKIE_NAME = "__session";

/** Set by middleware on protected routes so an expired session can return here after login. */
export const PATHNAME_HEADER = "x-ss-pathname";
