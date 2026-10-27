"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";


const COLOURS = [
  { name: "brand-700", value: "#0B7480", role: "buttons, links, teal text" },
  { name: "brand-600", value: "#0E9BA6", role: "large text / icons" },
  { name: "brand-500", value: "#16C2C6", role: "ring, dark accent, shapes" },
  { name: "brand-tint", value: "#EFFBFC", role: "tint" },
  { name: "brand-soft", value: "#D0F4F5", role: "soft tint" },
  { name: "ink", value: "#0F172A", role: "body text" },
  { name: "dark-band", value: "#07111F", role: "dark band" },
  { name: "white", value: "#FFFFFF", role: "surface" },
  { name: "slate-50", value: "#F8FAFC", role: "surface" },
  { name: "slate-100", value: "#F1F5F9", role: "accent surface" },
  { name: "border-subtle", value: "#E2E8F0", role: "dividers / hairlines" },
  { name: "border-ui", value: "#64748B", role: "controls (3:1 UI)" },
  { name: "muted", value: "#64748B", role: "muted on white" },
  { name: "muted-tinted", value: "#475569", role: "muted on tint" },
];

function contrastRatio(fg: string, bg: string) {
  const toLum = (hex: string) => {
    const h = hex.replace("#", "");
    const n = Number.parseInt(h, 16);
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const l1 = toLum(fg);
  const l2 = toLum(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
}

export function StyleguideClient() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-12 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="type-caption text-muted-foreground">Development only</p>
          <h1 className="type-display">Styleguide</h1>
          <p className="type-body-lg mt-2 text-muted-foreground">
            Tokens and components for Phase 1 review. Light colour scheme only.
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="type-h2">Colours</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COLOURS.map((c) => (
            <div
              key={c.name}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-[var(--shadow-1)]"
            >
              <div className="h-16" style={{ background: c.value }} />
              <div className="space-y-1 p-3">
                <p className="font-semibold">{c.name}</p>
                <p className="type-caption text-muted-foreground">{c.value}</p>
                <p className="type-small">{c.role}</p>
                <p className="type-caption">
                  vs white {contrastRatio(c.value, "#FFFFFF")}:1 · vs ink{" "}
                  {contrastRatio(c.value, "#0F172A")}:1
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="type-h2">Type scale</h2>
        <div className="space-y-3 rounded-[var(--radius-lg)] border border-border p-6">
          <p className="type-display">Display</p>
          <p className="type-h1">Heading 1</p>
          <p className="type-h2">Heading 2</p>
          <p className="type-h3">Heading 3</p>
          <p className="type-body-lg">Body large</p>
          <p>Body</p>
          <p className="type-small">Small</p>
          <p className="type-caption">Caption</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="type-h2">Spacing / radii / shadows</h2>
        <div className="flex flex-wrap gap-3">
          {[4, 8, 12, 16, 24, 32, 48, 64, 96].map((n) => (
            <div key={n} className="text-center">
              <div
                className="bg-[var(--brand-soft)]"
                style={{ width: n, height: n }}
              />
              <p className="type-caption mt-1">{n}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          {[8, 12, 16, 24].map((r) => (
            <div
              key={r}
              className="flex h-16 w-24 items-center justify-center border border-border bg-card"
              style={{ borderRadius: r }}
            >
              {r}px
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="rounded-[var(--radius-lg)] border border-border bg-card p-6"
              style={{ boxShadow: `var(--shadow-${s})` }}
            >
              shadow-{s}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="type-h2">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="type-h2">Inputs</h2>
        <div className="grid max-w-md gap-3">
          <Input placeholder="Normal" />
          <Input placeholder="Invalid" aria-invalid />
          <Textarea placeholder="Notes" />
          <div className="neu flex items-center justify-between rounded-[var(--radius-md)] px-3 py-2">
            <span className="type-small">Segmented / switch</span>
            <Switch defaultChecked />
          </div>
          <div className="neu-inset rounded-[var(--radius-md)] px-3 py-6 text-center type-small text-muted-foreground">
            Upload dropzone inset
          </div>
          <label className="flex items-center gap-2 type-small">
            <Checkbox defaultChecked />
            Checkbox
          </label>
          <RadioGroup defaultValue="a" className="flex gap-4">
            <label className="flex items-center gap-2 type-small">
              <RadioGroupItem value="a" />
              Radio A
            </label>
            <label className="flex items-center gap-2 type-small">
              <RadioGroupItem value="b" />
              Radio B
            </label>
          </RadioGroup>
          <div className="flex flex-wrap gap-3">
            <Popover>
              <PopoverTrigger render={<Button variant="outline">Popover</Button>} />
              <PopoverContent>Popover content</PopoverContent>
            </Popover>
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline">Tooltip</Button>} />
              <TooltipContent>Tooltip tip</TooltipContent>
            </Tooltip>
          </div>
          <Command className="rounded-[var(--radius-md)] border border-border-subtle">
            <CommandInput placeholder="Command..." />
            <CommandList>
              <CommandEmpty>No results</CommandEmpty>
              <CommandGroup heading="Actions">
                <CommandItem>Create invoice</CommandItem>
                <CommandItem>Open history</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="type-h2">Surfaces</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass rounded-[var(--radius-xl)] p-6">Glass panel</div>
          <div className="clay flex h-28 items-center justify-center">Clay tile</div>
          <Card>
            <CardHeader>
              <CardTitle>Card</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
        <Dialog>
          <DialogTrigger
            render={<Button variant="outline">Open dialog</Button>}
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog</DialogTitle>
              <DialogDescription>
                Glass modal surface with focus trap from the primitive.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}
