/** Business categories collected at onboarding / Account (shown in Admin). */
export const BUSINESS_TYPES = [
  "Freelancer / Consultant",
  "Construction & Trades",
  "Property & Real Estate",
  "Retail & E-commerce",
  "Hospitality & Food",
  "Health & Beauty",
  "Creative & Design",
  "IT & Software",
  "Legal, Accounting & Finance",
  "Marketing & Media",
  "Transport & Logistics",
  "Education & Training",
  "Cleaning & Maintenance",
  "Charity / Non-profit",
  "Other",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];
