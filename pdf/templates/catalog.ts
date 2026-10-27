/**
 * Invoice templates = layout + user accent colour.
 * Gallery shows the 9 layouts; colour is chosen separately.
 */

export const INVOICE_LAYOUTS = [
  {
    id: "classic",
    name: "Classic",
    description: "Left header, thin accent rule",
    group: "structured",
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Table first, striped rows, tabular numbers",
    group: "structured",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Centred Fraunces masthead, double rules, two-column meta",
    group: "structured",
  },
  {
    id: "mono",
    name: "Mono",
    description: "Bold black type with a dark table header",
    group: "structured",
  },
  {
    id: "edge",
    name: "Edge",
    description: "Soft tinted header panel with a thick accent edge",
    group: "structured",
  },
  {
    id: "banner",
    name: "Banner",
    description: "Full-width accent header with white type",
    group: "depth",
  },
  {
    id: "ribbon",
    name: "Ribbon",
    description: "Folded ribbon across the top left holding INVOICE",
    group: "depth",
  },
  {
    id: "pillar",
    name: "Pillar",
    description: "Raised accent column with embossed edge",
    group: "depth",
  },
  {
    id: "noir",
    name: "Noir",
    description: "Charcoal header with embossed accent plate",
    group: "depth",
  },
] as const;

export type InvoiceLayoutId = (typeof INVOICE_LAYOUTS)[number]["id"];

/** @deprecated Palette ids kept only for migrating old `layout-palette` template ids. */
export const LEGACY_PALETTE_HEX: Record<string, string> = {
  teal: "#0E9BA6",
  navy: "#1E3A8A",
  slate: "#334155",
  emerald: "#047857",
  indigo: "#4338CA",
  rose: "#BE123C",
  amber: "#B45309",
  cyan: "#0E7490",
  violet: "#6D28D9",
  forest: "#166534",
  charcoal: "#1F2937",
};

/** Map previous layout ids (and renames) onto the current set. */
const LEGACY_LAYOUT_MAP: Record<string, InvoiceLayoutId> = {
  bold: "ribbon",
  band: "ribbon",
  framed: "edge",
  minimal: "classic",
  modern: "banner",
  aurora: "banner",
  sidebar: "pillar",
  studio: "classic",
  elegant: "editorial",
  soft: "edge",
  /** Pre-18-catalog stacked header. */
  "split-stack": "classic",
  // Layouts retired in the 9-template catalog
  receipt: "classic",
  statement: "banner",
  corporate: "ledger",
  compact: "classic",
  fold: "classic",
  stack: "classic",
  clay: "edge",
  cube: "classic",
  tab: "edge",
  emboss: "mono",
  seal: "classic",
  split: "pillar",
};

export type InvoiceTemplateDefinition = {
  id: InvoiceLayoutId;
  name: string;
  layout: InvoiceLayoutId;
  /** Default accent when none is stored. */
  primary: string;
  accent: string;
  category: string;
  description: string;
};

export const DEFAULT_ACCENT = "#0E9BA6";
export const DEFAULT_INVOICE_TEMPLATE_ID: InvoiceLayoutId = "classic";

export const INVOICE_TEMPLATES: InvoiceTemplateDefinition[] =
  INVOICE_LAYOUTS.map((layout) => ({
    id: layout.id,
    name: layout.name,
    layout: layout.id,
    primary: DEFAULT_ACCENT,
    accent: DEFAULT_ACCENT,
    category: layout.group === "depth" ? "Depth" : "Structured",
    description: layout.description,
  }));

export const INVOICE_TEMPLATE_COUNT = INVOICE_TEMPLATES.length;

export const HOME_TEMPLATE_STRIP: InvoiceLayoutId[] = [
  "classic",
  "banner",
  "ribbon",
  "noir",
];

export const DEPTH_LAYOUT_IDS: InvoiceLayoutId[] = INVOICE_LAYOUTS.filter(
  (l) => l.group === "depth",
).map((l) => l.id);

export type ResolvedTemplate = {
  layoutId: InvoiceLayoutId;
  /** Accent hint from a legacy `layout-palette` id, if any. */
  legacyAccent?: string;
};

/**
 * Resolve a stored template id (modern layout id or legacy `classic-teal`).
 */
export function resolveTemplateRef(templateId?: string | null): ResolvedTemplate {
  if (!templateId) {
    return { layoutId: DEFAULT_INVOICE_TEMPLATE_ID };
  }
  const asLayout = INVOICE_LAYOUTS.find((l) => l.id === templateId);
  if (asLayout) return { layoutId: asLayout.id };

  const mapped = LEGACY_LAYOUT_MAP[templateId];
  if (mapped) return { layoutId: mapped };

  const dash = templateId.indexOf("-");
  if (dash > 0) {
    const layoutPart = templateId.slice(0, dash);
    const palettePart = templateId.slice(dash + 1);
    const layoutId =
      LEGACY_LAYOUT_MAP[layoutPart] ??
      (INVOICE_LAYOUTS.find((l) => l.id === layoutPart)?.id as
        | InvoiceLayoutId
        | undefined) ??
      DEFAULT_INVOICE_TEMPLATE_ID;
    const legacyAccent = LEGACY_PALETTE_HEX[palettePart];
    return { layoutId, legacyAccent };
  }

  return { layoutId: DEFAULT_INVOICE_TEMPLATE_ID };
}

export function getInvoiceTemplate(
  templateId?: string | null,
): InvoiceTemplateDefinition {
  const { layoutId } = resolveTemplateRef(templateId);
  return (
    INVOICE_TEMPLATES.find((t) => t.id === layoutId) ?? INVOICE_TEMPLATES[0]
  );
}

export function listInvoiceTemplatesByCategory() {
  return [
    {
      category: "Structured",
      templates: INVOICE_TEMPLATES.filter((t) => t.category === "Structured"),
    },
    {
      category: "Depth",
      templates: INVOICE_TEMPLATES.filter((t) => t.category === "Depth"),
    },
  ];
}

/** @deprecated Use LEGACY_PALETTE_HEX / accent presets. */
export type InvoicePaletteId = string;
