"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Logo } from "@/components/design-system/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AdminOverview, AdminUserRow } from "@/services/admin.service";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string | null) {
  return iso ? dateFormat.format(new Date(iso)) : "—";
}

const CSV_COLUMNS: [keyof AdminUserRow, string][] = [
  ["name", "Name"],
  ["email", "Login email"],
  ["businessName", "Business"],
  ["businessType", "Type of business"],
  ["phone", "Phone"],
  ["businessEmail", "Business email"],
  ["location", "Location"],
  ["invoiceCount", "Invoices"],
  ["signInMethod", "Sign-in"],
  ["joinedAt", "Joined"],
  ["lastSignInAt", "Last active"],
];

function downloadCsv(rows: AdminUserRow[]) {
  const escape = (value: unknown) => {
    const text = String(value ?? "");
    // Prefix formula-like cells so spreadsheets don't execute them.
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const lines = [
    CSV_COLUMNS.map(([, label]) => escape(label)).join(","),
    ...rows.map((row) =>
      CSV_COLUMNS.map(([key]) => escape(row[key])).join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sterlingsend-users-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border-subtle bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function AdminDashboard({ overview }: { overview: AdminOverview }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return overview.rows.filter((row) => {
      if (type !== "all" && (row.businessType || "Not set") !== type) {
        return false;
      }
      if (!q) return true;
      return [
        row.name,
        row.email,
        row.businessName,
        row.businessType,
        row.phone,
        row.location,
      ].some((value) => value.toLowerCase().includes(q));
    });
  }, [overview.rows, query, type]);

  return (
    <div className="min-h-screen bg-[var(--surface-page,#f8fafc)]">
      <header className="border-b border-border-subtle bg-card">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <span className="rounded-md bg-[var(--brand-tint)] px-2 py-0.5 text-xs font-semibold text-[var(--brand-700)]">
              Admin
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="type-h2 text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone who has signed up, with their business details.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Users" value={overview.totals.users} />
          <Stat label="With business profile" value={overview.totals.withBusiness} />
          <Stat label="With phone" value={overview.totals.withPhone} />
          <Stat label="Saved invoices" value={overview.totals.invoices} />
        </div>

        <div className="flex flex-wrap gap-2">
          {overview.byType.map(({ type: label, count }) => (
            <button
              key={label}
              type="button"
              onClick={() => setType(type === label ? "all" : label)}
              className={
                type === label
                  ? "rounded-md border border-[var(--brand-700)] bg-[var(--brand-700)] px-3 py-1.5 text-sm font-medium text-white"
                  : "rounded-md border border-border-subtle bg-card px-3 py-1.5 text-sm text-foreground hover:border-[var(--brand-600)]"
              }
            >
              {label} · {count}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, business, phone…"
              aria-label="Search users"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {rows.length} of {overview.rows.length}
            </p>
            <Button type="button" variant="outline" onClick={() => downloadCsv(rows)}>
              <Download className="h-4 w-4" aria-hidden />
              Download CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border-subtle bg-card">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-[var(--brand-tint)] text-xs uppercase tracking-wide text-[var(--brand-800)]">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Business</th>
                <th className="px-4 py-3 font-semibold">Type of business</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 text-right font-semibold">Invoices</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Last active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rows.map((row) => (
                <tr key={row.uid} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{row.name || "—"}</p>
                    <p className="text-muted-foreground">{row.email}</p>
                    <p className="text-xs text-muted-foreground">{row.signInMethod}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{row.businessName || "—"}</p>
                    {row.businessEmail && row.businessEmail !== row.email ? (
                      <p className="text-muted-foreground">{row.businessEmail}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-foreground">{row.businessType || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.phone ? (
                      <a
                        href={`tel:${row.phone.replace(/[^+\d]/g, "")}`}
                        className="text-[var(--brand-700)] hover:underline"
                      >
                        {row.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground">{row.location || "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.invoiceCount}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.joinedAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.lastSignInAt)}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    No users match.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
