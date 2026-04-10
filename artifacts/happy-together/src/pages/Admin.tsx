import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useApp } from "@/context/AppContext";
import { DropInfo } from "@/data/mockData";
import { KWCALogo } from "@/components/KWCALogo";
import { Link } from "wouter";

const ADMIN_ID = "happy123";
const ADMIN_PW = "together123";

const EMPTY_ROWS = 20;
type Row = { itemName: string; quantity: string };

function makeEmptyRows(): Row[] {
  return Array.from({ length: EMPTY_ROWS }, () => ({ itemName: "", quantity: "" }));
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
      if (id === ADMIN_ID && pw === ADMIN_PW) {
        onLogin();
      } else {
        setError("Invalid ID or password. Please try again.");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex justify-center">
            <KWCALogo size={64} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              KWCA Supply Management
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-md p-6 space-y-5">
          <div className="h-1 w-12 bg-primary rounded-full mx-auto" />

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
                onChange={(e) => { setId(e.target.value); setError(""); }}
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
                onChange={(e) => { setPw(e.target.value); setError(""); }}
                placeholder="Enter password"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Return to main page
          </Link>
        </p>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { dropInfo, updateDropInfo, publishList } = useApp();
  const [localDropInfo, setLocalDropInfo] = useState<DropInfo>({ ...dropInfo });
  const [rows, setRows] = useState<Row[]>(makeEmptyRows());
  const [published, setPublished] = useState(false);
  const [dropSaved, setDropSaved] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalDropInfo({ ...dropInfo });
  }, [dropInfo]);

  const handleCellKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    rowIdx: number,
    colIdx: number
  ) => {
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
      const inputs = tableRef.current?.querySelectorAll<HTMLInputElement>(
        `input[data-row][data-col]`
      );
      if (inputs) {
        const target = Array.from(inputs).find(
          (el) =>
            el.dataset.row === String(nextRow) &&
            el.dataset.col === String(nextCol)
        );
        target?.focus();
      }
    }
  };

  const updateRow = (idx: number, field: keyof Row, value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    if (published) setPublished(false);
  };

  const handleSaveDropInfo = () => {
    updateDropInfo(localDropInfo);
    setDropSaved(true);
    setTimeout(() => setDropSaved(false), 2000);
  };

  const handlePublish = () => {
    const validItems = rows
      .filter((r) => r.itemName.trim() !== "")
      .map((r) => ({
        itemName: r.itemName.trim(),
        quantity: Math.max(1, parseInt(r.quantity) || 1),
      }));

    if (validItems.length === 0) {
      alert("Please enter at least one item before publishing.");
      return;
    }

    updateDropInfo(localDropInfo);
    publishList(validItems);
    setPublished(true);
    setRows(makeEmptyRows());
  };

  const filledCount = rows.filter((r) => r.itemName.trim() !== "").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KWCALogo size={36} />
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground leading-tight">KWCA Supply Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              View Public Page
            </Link>
            <button
              onClick={onLogout}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted border border-border"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Drop Info Section */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Drop Information</h2>
              <p className="text-xs text-muted-foreground">Set this month's drop location and schedule</p>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Drop Location
              </label>
              <input
                type="text"
                value={localDropInfo.dropLocation}
                onChange={(e) => setLocalDropInfo((p) => ({ ...p, dropLocation: e.target.value }))}
                placeholder="e.g. Grace Fellowship Hall, Room 201"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Drop Date
              </label>
              <input
                type="text"
                value={localDropInfo.dropDate}
                onChange={(e) => setLocalDropInfo((p) => ({ ...p, dropDate: e.target.value }))}
                placeholder="e.g. April 19, 2026"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Schedule
              </label>
              <input
                type="text"
                value={localDropInfo.dropSchedule}
                onChange={(e) => setLocalDropInfo((p) => ({ ...p, dropSchedule: e.target.value }))}
                placeholder="e.g. Saturday 10:00 AM – 12:00 PM"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="px-6 pb-5">
            <button
              onClick={handleSaveDropInfo}
              className="h-9 px-5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-all border border-border/60"
            >
              {dropSaved ? (
                <span className="flex items-center gap-2 text-green-700">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </span>
              ) : (
                "Save Drop Info"
              )}
            </button>
          </div>
        </section>

        {/* Batch Input Table */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Batch Item Entry</h2>
                <p className="text-xs text-muted-foreground">
                  Use Tab key to navigate between fields. {filledCount > 0 && `${filledCount} item${filledCount !== 1 ? "s" : ""} entered.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setRows(makeEmptyRows())}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="overflow-x-auto" ref={tableRef}>
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-12">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Item Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-32">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      row.itemName ? "bg-primary/[0.02]" : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-4 py-2 text-xs text-muted-foreground font-mono">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        data-row={idx}
                        data-col={0}
                        type="text"
                        value={row.itemName}
                        onChange={(e) => updateRow(idx, "itemName", e.target.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, idx, 0)}
                        placeholder={idx === 0 ? "e.g. Rice (5 kg bag)" : ""}
                        className="w-full h-9 px-3 rounded-md border border-transparent bg-transparent text-sm focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/40"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        data-row={idx}
                        data-col={1}
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => updateRow(idx, "quantity", e.target.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, idx, 1)}
                        placeholder="1"
                        className="w-full h-9 px-3 rounded-md border border-transparent bg-transparent text-sm focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/40"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Publish Button */}
        <div className="flex flex-col items-center gap-3 py-4">
          {published && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm font-medium">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              List published successfully! The public page has been updated.
            </div>
          )}
          <button
            onClick={handlePublish}
            className="relative group h-14 px-10 rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <span className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Publish &nbsp;·&nbsp; 이번 달 리스트 게시하기</span>
            </span>
          </button>
          <p className="text-xs text-muted-foreground text-center max-w-sm">
            Publishing will replace the current item list with the entries above. This action updates the public page immediately.
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
