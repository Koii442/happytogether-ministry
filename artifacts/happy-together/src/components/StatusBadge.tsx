import { MonthStatus } from "@/data/mockData";

/** Unclaimed months share one neutral badge */
const OPEN_BADGE =
  "bg-neutral-200/95 text-neutral-800 border border-neutral-400/50 shadow-sm";

const styles: Record<Exclude<MonthStatus, "Draft" | "Available">, string> = {
  Reserved:
    "bg-amber-500 text-amber-950 border-2 border-amber-800 shadow-md ring-2 ring-amber-300/80",
  Ready:
    "bg-teal-600 text-white border-2 border-teal-800 shadow-md ring-2 ring-teal-300/70",
  Completed:
    "bg-emerald-700 text-white border-2 border-emerald-950 shadow-md ring-2 ring-emerald-300/70",
};

const dots: Record<MonthStatus, string> = {
  Draft: "bg-neutral-600",
  Available: "bg-neutral-600",
  Reserved: "bg-amber-950",
  Ready: "bg-white",
  Completed: "bg-white",
};

const labels: Record<Exclude<MonthStatus, "Draft" | "Available">, string> = {
  Reserved: "예약됨",
  Ready: "준비완료",
  Completed: "완료",
};

export function StatusBadge({ status }: { status: MonthStatus }) {
  if (status === "Draft" || status === "Available") {
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-[0.12em] ${OPEN_BADGE}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[status]}`} />
        OPEN
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${styles[status]}`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dots[status]}`} />
      {labels[status]}
    </span>
  );
}
