export const routes = {
  home: "/",
  createInvoice: "/create-invoice",
  invoicePreview: "/invoice-preview",
  features: "/features",
  pricing: "/pricing",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  customers: "/customers",
  customersNew: "/customers/new",
  customer: (id: string) => `/customers/${id}`,
  customerEdit: (id: string) => `/customers/${id}/edit`,
  invoices: "/invoices",
  invoicesNew: "/invoices/new",
  invoice: (id: string) => `/invoices/${id}`,
  invoiceEdit: (id: string) => `/invoices/${id}/edit`,
  invoicePdf: (id: string) => `/invoices/${id}/pdf`,
  publicInvoice: (token: string) => `/i/${token}`,
  services: "/services",
  servicesNew: "/services/new",
  service: (id: string) => `/services/${id}`,
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
  routes.pricing,
  routes.privacy,
  routes.terms,
  routes.cookies,
  routes.login,
  routes.signup,
  routes.forgotPassword,
] as const;

export const authRoutes = [
  routes.login,
  routes.signup,
  routes.forgotPassword,
] as const;

export const protectedRoutes = [
  routes.dashboard,
  routes.onboarding,
  routes.customers,
  routes.invoices,
  routes.services,
  routes.settings,
] as const;

export const SESSION_COOKIE_NAME = "__session";
