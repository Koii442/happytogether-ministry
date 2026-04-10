import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useApp } from "@/context/AppContext";
import { YEAR_PLAN, SAMPLE_ITEM_TEMPLATES, SupplyLineItem } from "@/data/mockData";
import { MinistryLogo } from "@/components/MinistryLogo";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BRAND_AFFILIATION, BRAND_MAIN } from "@/lib/branding";

const ADMIN_ID = "happy123";
const ADMIN_PW = "together 123";

const ROWS = 20;
type Row = { name: string; quantity: string };

function makeEmptyRows(): Row[] {
  return Array.from({ length: ROWS }, () => ({ name: "", quantity: "" }));
}

function rowsFromItems(items: SupplyLineItem[]): Row[] {
  const base = makeEmptyRows();
  items.slice(0, ROWS).forEach((it, i) => {
    base[i] = { name: it.name, quantity: it.quantity };
  });
  return base;
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (id === ADMIN_ID && (pw === ADMIN_PW || pw === "together123")) {
        onLogin();
      } else {
        setError("Invalid ID or password. Please try again.");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 space-y-3">
          <div className="flex justify-center">
            <MinistryLogo size={64} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-foreground">{BRAND_MAIN}</h1>
            <p className="font-serif text-sm text-muted-foreground leading-snug">{BRAND_AFFILIATION}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary pt-1">Admin sign-in</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-md p-6 space-y-5">
          <div className="h-1 w-12 bg-gradient-to-r from-primary to-orange-400 rounded-full mx-auto" />

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 flex items-center gap-2.5">
              <svg className="w-4 h-4 text-destructive flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Admin ID</label>
              <input
                type="text"
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  setError("");
                }}
                placeholder="Enter admin ID"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-semibold text-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Return to ministry page
          </Link>
        </p>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { months, publishMonth, resetMonthToAvailable } = useApp();
  const [selectedId, setSelectedId] = useState(YEAR_PLAN[0].id);
  const [dropLocation, setDropLocation] = useState("");
  const [dropDate, setDropDate] = useState("");
  const [schedule, setSchedule] = useState("");
  const [rows, setRows] = useState<Row[]>(makeEmptyRows());
  const [publishedFlash, setPublishedFlash] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const selected = months[selectedId];

  useEffect(() => {
    const m = months[selectedId];
    if (!m) return;
    setDropLocation(m.dropLocation);
    setDropDate(m.dropDate);
    setSchedule(m.schedule);
    setRows(rowsFromItems(m.items.length ? m.items : []));
  }, [selectedId, months]);

  const handleCellKeyDown = (e: KeyboardEvent<HTMLInputElement>, rowIdx: number, colIdx: number) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const totalCols = 2;
      const totalRows = rows.length;
      let nextRow = rowIdx;
      let nextCol = colIdx + 1;
      if (nextCol >= totalCols) {
        nextCol = 0;
        nextRow = rowIdx + 1;
        if (nextRow >= totalRows) nextRow = 0;
      }
      const inputs = tableRef.current?.querySelectorAll<HTMLInputElement>("input[data-item-row][data-item-col]");
      const target = Array.from(inputs ?? []).find(
        (el) => el.dataset.itemRow === String(nextRow) && el.dataset.itemCol === String(nextCol)
      );
      target?.focus();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const next = rowIdx + 1;
      if (next < ROWS) {
        const inputs = tableRef.current?.querySelectorAll<HTMLInputElement>(
          `input[data-item-row="${next}"][data-item-col="0"]`
        );
        inputs?.[0]?.focus();
      }
    }
  };

  const updateRow = (idx: number, field: keyof Row, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSavePublish = () => {
    const itemPayload: SupplyLineItem[] = rows.map((r) => ({
      name: r.name.trim(),
      quantity: r.quantity.trim(),
    }));
    const hasItem = itemPayload.some((r) => r.name.length > 0);
    if (!hasItem) {
      alert("Add at least one item name before saving.");
      return;
    }
    if (!dropLocation.trim() || !dropDate.trim() || !schedule.trim()) {
      alert("Please fill in drop location, date, and schedule.");
      return;
    }
    publishMonth(selectedId, {
      items: itemPayload,
      dropLocation: dropLocation.trim(),
      dropDate: dropDate.trim(),
      schedule: schedule.trim(),
    });
    setPublishedFlash(true);
    setTimeout(() => setPublishedFlash(false), 4000);
  };

  const handleReset = () => {
    if (!selected) return;
    if (selected.status === "Draft" || selected.status === "Available") {
      alert("This month is not assigned to a group.");
      return;
    }
    if (
      !window.confirm(
        "Reset this month to Available? The current group assignment and PIN will be cleared. They can sign up again from the public page."
      )
    ) {
      return;
    }
    resetMonthToAvailable(selectedId);
  };

  const fillSample = () => {
    const r = makeEmptyRows();
    SAMPLE_ITEM_TEMPLATES.forEach((name, i) => {
      if (i < ROWS) r[i] = { name, quantity: "1" };
    });
    setRows(r);
  };

  const filledCount = rows.filter((r) => r.name.trim() !== "").length;
  const claimLabel =
    selected && selected.cellGroup.trim()
      ? `${selected.cellGroup} (PIN set)`
      : "—";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 h-[4.25rem] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <MinistryLogo size={36} />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-[15px] font-serif font-semibold text-foreground leading-tight truncate tracking-wide">
                {BRAND_MAIN}
              </h1>
              <p className="font-serif text-[10px] sm:text-[11px] text-muted-foreground leading-snug line-clamp-2 italic">
                {BRAND_AFFILIATION}
              </p>
              <p className="text-[10px] font-semibold text-primary/90 truncate pt-0.5">Admin · Monthly packages</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted"
            >
              Public page
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted border border-border"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="relative overflow-hidden rounded-2xl border-2 border-orange-400/45 bg-gradient-to-br from-orange-600 via-primary to-amber-400 text-white shadow-xl shadow-orange-950/15 ring-1 ring-white/15 px-6 py-7 md:px-8 md:py-9">
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/12 -translate-y-1/3 translate-x-1/4" />
          <div className="relative space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight [text-shadow:0_2px_20px_rgba(0,0,0,0.18)] leading-tight">
              {BRAND_MAIN}
            </h2>
            <p className="font-serif text-base sm:text-lg text-white/95 font-medium tracking-wide leading-snug italic">
              {BRAND_AFFILIATION}
            </p>
            <p className="text-white/90 text-sm leading-relaxed border-l-4 border-white/35 pl-3 pt-1">
              Package editor — choose a month, enter drop-off details and all 20 supply lines, then save &amp; publish
              to the roadmap.
            </p>
          </div>
        </div>

        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">1 · Select month</Label>
            <p className="text-xs text-muted-foreground">Pick which month to edit or publish.</p>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full h-12 text-base border-2">
                <SelectValue placeholder="Choose month" />
              </SelectTrigger>
              <SelectContent>
                {YEAR_PLAN.map(({ id, label }) => (
                  <SelectItem key={id} value={id}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selected && (
            <div className="rounded-xl border-2 border-amber-200/80 bg-amber-50/50 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">Assignment</p>
                  <p className="text-sm text-foreground mt-1">
                    <span className="font-medium">Status:</span>{" "}
                    <Badge variant="secondary" className="ml-1 font-semibold">
                      {selected.status}
                    </Badge>
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium text-foreground">Claimed by:</span>{" "}
                    <span className="text-muted-foreground">{claimLabel}</span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={handleReset}
                  disabled={selected.status === "Draft" || selected.status === "Available"}
                >
                  Reset to Available
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Use reset if a group cancels. The month becomes open again on the public roadmap (progress and PIN
                cleared).
              </p>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-base font-semibold">2 · Drop-off details</Label>
            <p className="text-xs text-muted-foreground pb-2">Location, date, and time window.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loc">Location</Label>
              <Input
                id="loc"
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                placeholder="e.g. Grace Fellowship Hall, Room 201"
                className="border-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dt">Date</Label>
              <Input
                id="dt"
                value={dropDate}
                onChange={(e) => setDropDate(e.target.value)}
                placeholder="e.g. Saturday, May 16, 2026"
                className="border-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sch">Time schedule</Label>
              <Input
                id="sch"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="e.g. Saturday 10:00 AM – 12:00 PM"
                className="border-2"
              />
            </div>
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">3 · Supply list (20 rows)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Excel-style entry · {filledCount} rows with item names · Tab moves across cells
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setRows(makeEmptyRows())}>
                Clear all
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={fillSample}>
                Fill sample
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto" ref={tableRef}>
            <table className="w-full min-w-[520px] text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b-2 border-border">
                  <th className="text-left px-3 py-3 text-xs font-bold text-foreground w-12 border-r border-border/60">
                    #
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-bold text-foreground border-r border-border/60">
                    Item name
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-bold text-foreground w-28">Qty</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-border/50 ${idx % 2 === 0 ? "bg-background" : "bg-muted/15"} ${
                      row.name.trim() ? "bg-primary/[0.03]" : ""
                    }`}
                  >
                    <td className="px-3 py-1.5 text-xs font-mono text-muted-foreground align-middle border-r border-border/40">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="px-2 py-1 border-r border-border/40">
                      <input
                        data-item-row={idx}
                        data-item-col={0}
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(idx, "name", e.target.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, idx, 0)}
                        placeholder={idx === 0 ? "e.g. Rice 5kg" : ""}
                        className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/35"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        data-item-row={idx}
                        data-item-col={1}
                        type="text"
                        value={row.quantity}
                        onChange={(e) => updateRow(idx, "quantity", e.target.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, idx, 1)}
                        placeholder="1"
                        className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/35"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-col items-center gap-4 py-2 pb-12">
          {publishedFlash && (
            <div className="flex items-center gap-2 bg-emerald-50 border-2 border-emerald-200 text-emerald-900 rounded-xl px-5 py-3 text-sm font-medium max-w-lg text-center">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Saved & published. This month&apos;s package and drop-off info are live on the public roadmap (mock data).
            </div>
          )}
          <Button
            type="button"
            size="lg"
            className="h-14 px-12 rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-base shadow-lg hover:opacity-95 border-0"
            onClick={handleSavePublish}
          >
            Save &amp; Publish
          </Button>
          <p className="text-xs text-muted-foreground text-center max-w-lg leading-relaxed">
            Draft months become <span className="font-medium text-foreground">Available</span>. Assigned months keep
            their group unless you use Reset.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  return <AdminDashboard onLogout={() => setLoggedIn(false)} />;
}
