import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  MonthPackage,
  SUPPLY_LIST_SLOT_COUNT,
  YEAR_PLAN,
  buildRollingMonthIds,
  countSupplyItems,
  findAdminAnchorMonthId,
  getCardStepperSummary,
  getProgressStepLevel,
  isCalendarMonthFullyPast,
} from "@/data/mockData";
import { MinistryLogo } from "@/components/MinistryLogo";
import { StatusBadge } from "@/components/StatusBadge";
import { CardDeliveryStepper, type StepperTone } from "@/components/CardDeliveryStepper";
import { ClaimModal } from "@/components/ClaimModal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BRAND_AFFILIATION, BRAND_MAIN } from "@/lib/branding";

const ITEMS_PENDING_NOTE = "Items will be updated soon.";

function monthToStepperTone(status: MonthPackage["status"]): StepperTone {
  if (status === "Draft" || status === "Available") return "open";
  if (status === "Reserved") return "reserved";
  if (status === "Ready") return "ready";
  return "completed";
}

function SupplyListRows({ month }: { month: MonthPackage }) {
  const hasNamed = countSupplyItems(month) > 0;
  const rows = Array.from({ length: SUPPLY_LIST_SLOT_COUNT }, (_, i) => month.items[i] ?? { name: "", quantity: "" });
  return (
    <>
      {!hasNamed && (
        <p className="text-sm text-muted-foreground px-3 py-2.5 border-b border-border/60 bg-muted/25 leading-relaxed">
          {ITEMS_PENDING_NOTE}
        </p>
      )}
      <ul className="max-h-56 overflow-y-auto text-sm divide-y divide-border/50">
        {rows.map((line, i) => (
          <li
            key={i}
            className={`flex flex-wrap gap-x-3 gap-y-1 px-3 py-2.5 ${
              i % 2 === 0 ? "bg-background/50" : "bg-muted/25"
            } ${month.status === "Completed" ? "opacity-80" : ""}`}
          >
            <span className="font-mono text-xs font-bold text-muted-foreground w-7 shrink-0 pt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={`flex-1 min-w-[120px] font-medium leading-snug ${
                month.status === "Completed" && line.name.trim()
                  ? "line-through text-muted-foreground"
                  : line.name.trim()
                    ? "text-foreground"
                    : "text-muted-foreground/70"
              }`}
            >
              {line.name.trim() ? line.name : "—"}
            </span>
            {line.quantity && line.name.trim() ? (
              <span className="text-xs font-semibold text-muted-foreground tabular-nums shrink-0">
                × {line.quantity}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}

function MonthCard({
  month,
  onOpen,
  roadmapStep,
  roadmapTotal,
}: {
  month: MonthPackage;
  onOpen: (m: MonthPackage) => void;
  roadmapStep?: number;
  roadmapTotal?: number;
}) {
  const isOpen = month.status === "Draft" || month.status === "Available";
  const stepLevel = getProgressStepLevel(month.status);
  const stepperSummary = getCardStepperSummary(month);
  const stepperTone = monthToStepperTone(month.status);

  const [supplyOpen, setSupplyOpen] = useState(false);

  const cardVisual =
    month.status === "Reserved"
      ? "border-amber-400/90 bg-gradient-to-b from-amber-50 to-amber-100/50 shadow-md ring-2 ring-amber-200/70"
      : month.status === "Ready"
        ? "border-teal-300/85 bg-gradient-to-b from-teal-50/55 to-card ring-1 ring-teal-200/65"
        : month.status === "Completed"
          ? "border-emerald-300/80 bg-gradient-to-b from-emerald-50/50 to-muted/20 opacity-95"
          : isOpen
            ? "border-neutral-300/75 bg-neutral-50/40 hover:bg-neutral-50/70 hover:shadow-md ring-1 ring-neutral-200/70"
            : "border-border bg-card";

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onOpen(month)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(month);
        }
      }}
      className={`flex flex-col overflow-hidden transition-all duration-200 cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        isOpen ? "focus-visible:ring-neutral-400/70" : "focus-visible:ring-primary"
      } ${cardVisual}`}
    >
      <CardHeader className="pb-3 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            {roadmapStep != null && roadmapTotal != null && (
              <p
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  isOpen ? "text-neutral-500" : "text-primary/90"
                }`}
              >
                Roadmap {String(roadmapStep).padStart(2, "0")} / {String(roadmapTotal).padStart(2, "0")}
              </p>
            )}
            <h3 className="text-lg font-bold tracking-tight text-foreground">{month.label}</h3>
          </div>
          <StatusBadge status={month.status} />
        </div>

        <CardDeliveryStepper step={stepLevel} summary={stepperSummary} tone={stepperTone} />

        {isOpen && (
          <div className="rounded-lg border border-border/80 bg-muted/35 p-3 space-y-2 text-xs">
            <div className="flex gap-2">
              <span className="font-semibold text-neutral-700 shrink-0 w-20">Drop-off</span>
              <span className="text-muted-foreground">{month.dropDate || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-neutral-700 shrink-0 w-20">Location</span>
              <span className="text-muted-foreground leading-snug">{month.dropLocation || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-neutral-700 shrink-0 w-20">Schedule</span>
              <span className="text-muted-foreground">{month.schedule || "—"}</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 pt-0 space-y-3">
        <div
          className="rounded-xl border-2 border-foreground/10 bg-card shadow-inner overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Collapsible open={supplyOpen} onOpenChange={setSupplyOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-expanded={supplyOpen}
                className="w-full px-3 py-2.5 bg-foreground/[0.04] border-b-2 border-border/60 flex items-center justify-between gap-2 text-left hover:bg-foreground/[0.07] transition-colors cursor-pointer"
              >
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wide text-foreground">
                    Supply list
                  </span>
                  <span className="text-xs font-mono font-bold text-muted-foreground bg-background px-2 py-0.5 rounded-md border border-border">
                    ({SUPPLY_LIST_SLOT_COUNT} items)
                  </span>
                </div>
                <span className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-neutral-600">
                  <span className="text-muted-foreground">{supplyOpen ? "Hide" : "Show"}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-neutral-600 transition-transform duration-300 ease-out",
                      supplyOpen && "rotate-180"
                    )}
                    aria-hidden
                  />
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent
              forceMount
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                "data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]"
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <SupplyListRows month={month} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {isOpen && (
          <Button
            type="button"
            variant="secondary"
            className="w-full h-11 text-sm font-semibold border border-neutral-400/50 bg-neutral-200/80 text-neutral-900 hover:bg-neutral-300/90 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(month);
            }}
          >
            Claim this month
          </Button>
        )}
      </CardContent>

      <CardFooter className="pt-1 pb-4 border-t border-border/40">
        <p className="text-xs font-semibold text-center w-full text-muted-foreground">
          {isOpen && "Tap Claim this month or the card · 예약하기"}
          {month.status === "Reserved" && "Tap card to update status (PIN required)"}
          {month.status === "Ready" && "Tap card to mark complete when finished"}
          {month.status === "Completed" && "Tap card to view progress history"}
        </p>
      </CardFooter>
    </Card>
  );
}

export default function Home() {
  const { months } = useApp();
  const [activeMonth, setActiveMonth] = useState<MonthPackage | null>(null);

  const roadmap = useMemo(() => {
    const anchorId = findAdminAnchorMonthId(months);
    const rolling = buildRollingMonthIds(anchorId);
    const now = new Date();
    const visible = rolling.filter((id) => !isCalendarMonthFullyPast(id, now));
    const anchorLabel = YEAR_PLAN.find((x) => x.id === anchorId)?.label ?? anchorId;
    return {
      anchorId,
      anchorLabel,
      visibleIds: visible,
      pastHidden: rolling.length - visible.length,
    };
  }, [months]);

  const visibleCount = roadmap.visibleIds.length;
  const publishedInView = roadmap.visibleIds.filter((id) => months[id]?.status !== "Draft").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MinistryLogo size={36} />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-[15px] font-serif font-semibold text-foreground leading-tight tracking-wide">
                {BRAND_MAIN}
              </h1>
              <p className="font-serif text-[11px] sm:text-xs text-muted-foreground leading-snug mt-0.5">
                {BRAND_AFFILIATION}
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <div className="relative overflow-hidden rounded-2xl border border-border/90 bg-gradient-to-br from-neutral-50 via-white to-stone-50/70 text-foreground shadow-sm">
          <div className="absolute top-0 right-0 w-[28rem] h-[28rem] rounded-full bg-neutral-200/20 -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
          <div className="relative p-8 md:p-11 space-y-5">
            <div className="space-y-2 md:space-y-3 max-w-4xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-serif font-semibold tracking-tight text-neutral-900 leading-[1.08]">
                {BRAND_MAIN}
              </h2>
              <p className="font-serif text-base sm:text-lg md:text-xl text-neutral-600 font-medium tracking-[0.02em] leading-snug">
                {BRAND_AFFILIATION}
              </p>
            </div>
            <p className="text-neutral-700 text-base md:text-lg font-normal max-w-3xl leading-relaxed border-l-4 border-neutral-300 pl-4 pt-1">
              Monthly sponsorship roadmap — one cell group serves the full package each month. Browse the calendar,
              reserve an open month, and track Reserved → Prepared → Completed.
            </p>
            <p className="text-neutral-600 text-sm md:text-base max-w-2xl leading-relaxed">
              The timeline starts at{" "}
              <span className="font-semibold text-neutral-900">{roadmap.anchorLabel}</span> (most recently updated).
              Past months are hidden automatically.
            </p>
            <div className="flex flex-wrap gap-8 pt-1 text-sm">
              <div>
                <p className="text-3xl font-semibold tabular-nums text-neutral-900">{visibleCount}</p>
                <p className="text-neutral-500 text-xs font-medium">Months in view</p>
              </div>
              <div>
                <p className="text-3xl font-semibold tabular-nums text-neutral-900">{publishedInView}</p>
                <p className="text-neutral-500 text-xs font-medium">Published on roadmap</p>
              </div>
              {roadmap.pastHidden > 0 && (
                <div>
                  <p className="text-3xl font-semibold tabular-nums text-neutral-800">{roadmap.pastHidden}</p>
                  <p className="text-neutral-500 text-xs font-medium">Past months archived</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {visibleCount === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Every month in the current cycle is already in the past. Check back when new months are published.
          </p>
        ) : (
          <section aria-label="Monthly sponsorship timeline">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 border-b border-border/60 pb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Timeline</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  May 2026 → April 2027 cycle · chronological · anchored at {roadmap.anchorLabel}
                </p>
              </div>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10 list-none p-0 m-0">
              {roadmap.visibleIds.map((id, i) => {
                const m = months[id];
                if (!m) return null;
                const step = i + 1;
                const total = roadmap.visibleIds.length;
                return (
                  <li
                    key={id}
                    className="relative min-w-0 pl-3 md:pl-0 border-l-2 md:border-l-0 border-neutral-200/90 md:border-0"
                  >
                    <MonthCard
                      month={m}
                      onOpen={setActiveMonth}
                      roadmapStep={step}
                      roadmapTotal={total}
                    />
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </main>

      {activeMonth && <ClaimModal month={activeMonth} onClose={() => setActiveMonth(null)} />}

      <footer className="mt-16 py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/90">{BRAND_MAIN}</span>
            <span className="mx-1.5">·</span>
            <span className="font-serif text-[13px]">{BRAND_AFFILIATION}</span>
            <span className="mx-1.5">·</span>
            Monthly sponsorship
          </p>
        </div>
      </footer>
    </div>
  );
}
