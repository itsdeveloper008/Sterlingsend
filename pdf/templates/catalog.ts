/**
 * Parametric invoice template catalog.
 * 8 layouts × 11 palettes = 88 distinct designs.
 */

export const INVOICE_LAYOUTS = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean header with top accent bar",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Bold title block and soft panels",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Strong colored header band",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Sparse rules and quiet typography",
  },
  {
    id: "sidebar",
    name: "Sidebar",
    description: "Left color rail with airy content",
  },
  {
    id: "band",
    name: "Band",
    description: "Wide brand strip across the top",
  },
  {
    id: "framed",
    name: "Framed",
    description: "Inset frame with rounded corners",
  },
  {
    id: "split",
    name: "Split",
    description: "Two-column business and meta layout",
  },
] as const;

export const INVOICE_PALETTES = [
  { id: "teal", name: "Teal", primary: "#0d9488", accent: "#14b8a6" },
  { id: "navy", name: "Navy", primary: "#1e3a8a", accent: "#3b82f6" },
  { id: "slate", name: "Slate", primary: "#334155", accent: "#64748b" },
  { id: "emerald", name: "Emerald", primary: "#047857", accent: "#10b981" },
  { id: "indigo", name: "Indigo", primary: "#4338ca", accent: "#818cf8" },
  { id: "rose", name: "Rose", primary: "#be123c", accent: "#fb7185" },
  { id: "amber", name: "Amber", primary: "#b45309", accent: "#f59e0b" },
  { id: "cyan", name: "Cyan", primary: "#0e7490", accent: "#22d3ee" },
  { id: "violet", name: "Violet", primary: "#6d28d9", accent: "#a78bfa" },
  { id: "forest", name: "Forest", primary: "#166534", accent: "#4ade80" },
  { id: "charcoal", name: "Charcoal", primary: "#111827", accent: "#6b7280" },
] as const;

export type InvoiceLayoutId = (typeof INVOICE_LAYOUTS)[number]["id"];
export type InvoicePaletteId = (typeof INVOICE_PALETTES)[number]["id"];

export type InvoiceTemplateDefinition = {
  id: string;
  name: string;
  layout: InvoiceLayoutId;
  palette: InvoicePaletteId;
  primary: string;
  accent: string;
  category: string;
  description: string;
};

function buildCatalog(): InvoiceTemplateDefinition[] {
  const templates: InvoiceTemplateDefinition[] = [];
  for (const layout of INVOICE_LAYOUTS) {
    for (const palette of INVOICE_PALETTES) {
      templates.push({
        id: `${layout.id}-${palette.id}`,
        name: `${palette.name} ${layout.name}`,
        layout: layout.id,
        palette: palette.id,
        primary: palette.primary,
        accent: palette.accent,
        category: layout.name,
        description: `${layout.description} · ${palette.name} palette`,
      });
    }
  }
  return templates;
}

export const INVOICE_TEMPLATES = buildCatalog();

export const DEFAULT_INVOICE_TEMPLATE_ID = "classic-teal";

export function getInvoiceTemplate(
  templateId?: string | null,
): InvoiceTemplateDefinition {
  const found = INVOICE_TEMPLATES.find((t) => t.id === templateId);
  return (
    found ??
    INVOICE_TEMPLATES.find((t) => t.id === DEFAULT_INVOICE_TEMPLATE_ID) ??
    INVOICE_TEMPLATES[0]
  );
}

export function listInvoiceTemplatesByCategory() {
  const map = new Map<string, InvoiceTemplateDefinition[]>();
  for (const template of INVOICE_TEMPLATES) {
    const list = map.get(template.category) ?? [];
    list.push(template);
    map.set(template.category, list);
  }
  return Array.from(map.entries()).map(([category, templates]) => ({
    category,
    templates,
  }));
}

export const INVOICE_TEMPLATE_COUNT = INVOICE_TEMPLATES.length;
