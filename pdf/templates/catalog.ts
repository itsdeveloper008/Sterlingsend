/**
 * Invoice templates = layout + user accent colour.
 * Gallery shows the 18 layouts; colour is chosen separately.
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
    id: "receipt",
    name: "Receipt",
    description: "Narrow centred column, dotted separators, large total",
    group: "structured",
  },
  {
    id: "statement",
    name: "Statement",
    description: "Large accent Amount due block at the top",
    group: "structured",
  },
  {
    id: "split",
    name: "Split Page",
    description: "Two-column page with accent left rail",
    group: "structured",
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Bordered cells in a formal grid",
    group: "structured",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Dense one-line header for long item lists",
    group: "structured",
  },
  {
    id: "ribbon",
    name: "Ribbon",
    description: "Folded ribbon across the top left holding INVOICE",
    group: "depth",
  },
  {
    id: "fold",
    name: "Fold",
    description: "Dog-ear corner and layered paper edge",
    group: "depth",
  },
  {
    id: "stack",
    name: "Stack",
    description: "Header on two offset paper layers",
    group: "depth",
  },
  {
    id: "pillar",
    name: "Pillar",
    description: "Raised accent column with embossed edge",
    group: "depth",
  },
  {
    id: "clay",
    name: "Clay",
    description: "Soft inflated clay panels and total pillow",
    group: "depth",
  },
  {
    id: "cube",
    name: "Cube",
    description: "Isometric cube cluster with reserved space",
    group: "depth",
  },
  {
    id: "tab",
    name: "Tab",
    description: "File-folder tabs for section labels",
    group: "depth",
  },
  {
    id: "emboss",
    name: "Emboss",
    description: "Raised total plate and letterpress headings",
    group: "depth",
  },
  {
    id: "seal",
    name: "Seal",
    description: "Round medallion for the invoice number",
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
  teal: "#0D9488",
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
  framed: "clay",
  minimal: "fold",
  modern: "statement",
  aurora: "statement",
  sidebar: "pillar",
  studio: "cube",
  elegant: "editorial",
  soft: "tab",
  /** Pre-18-catalog "split" was a stacked header; real Split Page is now `split`. */
  "split-stack": "stack",
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

export const DEFAULT_ACCENT = "#0D9488";
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
  "ribbon",
  "split",
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
