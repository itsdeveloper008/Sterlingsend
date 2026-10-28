"use client";

import { useMemo, useState } from "react";
import { Download, LogOut, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4">
      <p className="text-[13px] text-[#9FD3D6]">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-white">
        {value.toLocaleString("en-GB")}
      </p>
    </div>
  );
}

function initials(row: AdminUserRow) {
  const source = row.name || row.email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function AdminDashboard({
  overview,
  adminEmail,
}: {
  overview: AdminOverview;
  adminEmail: string;
}) {
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
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
    <div className="min-h-screen bg-[#F4F6F5]">
      <div
        className="text-white"
        style={{
          backgroundColor: "#0A3A43",
          backgroundImage: [
            "radial-gradient(ellipse at 20% 0%, rgba(20,160,170,0.25), transparent 55%)",
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 28px)",
          ].join(","),
        }}
      >
        <header className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
              <Image src={siteConfig.logo} alt="" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
            </span>
            <span className="hidden text-sm font-medium tracking-[0.22em] sm:inline">STERLINGSEND</span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold tracking-[0.16em] text-[#7DD8DD]">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href={routes.home} className="hidden text-sm text-white/70 hover:text-white sm:inline">
              View site
            </Link>
            <span className="hidden text-sm text-white/50 md:inline">{adminEmail}</span>
            <button
              type="button"
              disabled={signingOut}
              onClick={async () => {
                setSigningOut(true);
                await signOut();
                window.location.assign(routes.login);
              }}
              className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border border-white/20 px-3 text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-8 sm:px-6">
          <h1 className="font-display text-[34px] font-semibold leading-tight tracking-tight !text-white">
            Users
          </h1>
          <p className="mt-1 text-sm text-white/65">
            Everyone who has signed up, with their business details.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Users" value={overview.totals.users} />
            <Stat label="With business profile" value={overview.totals.withBusiness} />
            <Stat label="With phone" value={overview.totals.withPhone} />
            <Stat label="Saved invoices" value={overview.totals.invoices} />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] space-y-5 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setType("all")}
              className={chipClass(type === "all")}
            >
              All · {overview.rows.length}
            </button>
            {overview.byType.map(({ type: label, count }) => (
              <button
                key={label}
                type="button"
                onClick={() => setType(type === label ? "all" : label)}
                className={chipClass(type === label)}
              >
                {label} · {count}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9A99]"
                aria-hidden
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users"
                aria-label="Search users"
                className="h-10 w-full rounded-xl border border-[#E3E8E6] bg-white pl-10 pr-3 text-sm text-[#0B2E35] outline-none placeholder:text-[#8A9A99] focus:border-[#0E7C86] focus:shadow-[0_0_0_4px_rgba(14,124,134,0.12)]"
              />
            </div>
            <button
              type="button"
              onClick={() => downloadCsv(rows)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#0A3A43] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0E4D58]"
            >
              <Download className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Download CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E3E8E6] bg-white shadow-[0_1px_2px_rgba(10,58,67,0.04)]">
          <div className="flex items-center justify-between border-b border-[#EEF1F0] px-5 py-3 text-sm text-[#5B6B6A]">
            <span>
              Showing <strong className="font-semibold text-[#0B2E35]">{rows.length}</strong> of{" "}
              {overview.rows.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="text-xs text-[#6B7B7A]">
                <tr className="border-b border-[#EEF1F0]">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 text-right font-medium">Invoices</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Last active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1F0] text-[#0B2E35]">
                {rows.map((row) => (
                  <tr key={row.uid} className="align-top transition-colors hover:bg-[#F7FAF9]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E3F2F2] text-xs font-bold text-[#0A5560]">
                          {initials(row)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium">{row.name || "—"}</p>
                          <p className="text-[#5B6B6A]">{row.email}</p>
                          <p className="mt-0.5 text-xs text-[#8A9A99]">{row.signInMethod}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p>{row.businessName || "—"}</p>
                      {row.businessEmail && row.businessEmail !== row.email ? (
                        <p className="text-[#5B6B6A]">{row.businessEmail}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5">
                      {row.businessType ? (
                        <span className="inline-flex rounded-full bg-[#F1F4F3] px-2.5 py-0.5 text-xs font-medium text-[#33504F]">
                          {row.businessType}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {row.phone ? (
                        <a
                          href={`tel:${row.phone.replace(/[^+\d]/g, "")}`}
                          className="text-[#0E7C86] hover:underline"
                        >
                          {row.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3.5">{row.location || "—"}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums">{row.invoiceCount}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#5B6B6A]">{formatDate(row.joinedAt)}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[#5B6B6A]">{formatDate(row.lastSignInAt)}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center text-[#6B7B7A]">
                      No users match.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function chipClass(active: boolean) {
  return active
    ? "rounded-full bg-[#0A3A43] px-3.5 py-1.5 text-sm font-medium text-white"
    : "rounded-full border border-[#E3E8E6] bg-white px-3.5 py-1.5 text-sm text-[#33504F] transition-colors hover:border-[#0E7C86]";
}
