/** Admin / lifecycle: Draft = not published; Available = open to claim */
export type MonthStatus =
  | "Draft"
  | "Available"
  /** Step 1 — 예약됨 */
  | "Reserved"
  /** Step 2 — 준비완료 */
  | "Ready"
  /** Step 3 — 완료 */
  | "Completed";

export interface SupplyLineItem {
  name: string;
  quantity: string;
}

export interface MonthPackage {
  id: string;
  label: string;
  items: SupplyLineItem[];
  dropLocation: string;
  dropDate: string;
  schedule: string;
  status: MonthStatus;
  cellGroup: string;
  pin: string;
  /** Unix ms — set when admin publishes/updates items; drives roadmap anchor */
  lastUpdatedAt: number;
}

/** May 2026 → April 2027 (12 months) */
export const YEAR_PLAN: { id: string; label: string }[] = [
  { id: "2026-05", label: "May 2026" },
  { id: "2026-06", label: "June 2026" },
  { id: "2026-07", label: "July 2026" },
  { id: "2026-08", label: "August 2026" },
  { id: "2026-09", label: "September 2026" },
  { id: "2026-10", label: "October 2026" },
  { id: "2026-11", label: "November 2026" },
  { id: "2026-12", label: "December 2026" },
  { id: "2027-01", label: "January 2027" },
  { id: "2027-02", label: "February 2027" },
  { id: "2027-03", label: "March 2027" },
  { id: "2027-04", label: "April 2027" },
];

export const SAMPLE_ITEM_TEMPLATES = [
  "Rice 5kg",
  "Cooking oil 1L",
  "Instant noodles (box of 24)",
  "Canned soup (12 cans)",
  "Paper towels (8 rolls)",
  "Dish soap 500ml",
  "Laundry detergent 2kg",
  "Baby wipes (pack of 3)",
  "Soy sauce 500ml",
  "Sesame oil 250ml",
  "Toilet paper (12 rolls)",
  "Hand sanitizer 300ml",
  "Canned tuna (pack of 6)",
  "Facial tissues (3 boxes)",
  "Sugar 1kg",
  "Salt 500g",
  "Trash bags (box of 20)",
  "Ramen (pack of 5)",
  "Canned beans (6 cans)",
  "All-purpose flour 2kg",
];

function itemsForMonth(seed: number): SupplyLineItem[] {
  return SAMPLE_ITEM_TEMPLATES.map((t, i) => ({
    name: (i + seed) % 3 === 0 ? t : `${t} (${String.fromCharCode(65 + ((i + seed) % 26))})`,
    quantity: "1",
  }));
}

/** Public cards and admin editor both use 20 supply lines */
export const SUPPLY_LIST_SLOT_COUNT = 20;

export function countSupplyItems(m: MonthPackage): number {
  return m.items.filter((i) => i.name.trim()).length;
}

const HALL = "Grace Fellowship Hall, Room 201";

function baseMonth(id: string, label: string, overrides: Partial<MonthPackage>): MonthPackage {
  return {
    id,
    label,
    items: [],
    dropLocation: HALL,
    dropDate: "TBD",
    schedule: "Saturday 10:00 AM – 12:00 PM",
    status: "Draft",
    cellGroup: "",
    pin: "",
    lastUpdatedAt: 0,
    ...overrides,
  };
}

/** `YYYY-MM` → { y, m } with m = 1–12 */
export function parseYearMonthId(id: string): { y: number; m: number } {
  const [ys, ms] = id.split("-");
  return { y: Number(ys), m: Number(ms) };
}

/** True if the entire calendar month ended before the start of `now` (local). */
export function isCalendarMonthFullyPast(monthId: string, now: Date = new Date()): boolean {
  const { y, m } = parseYearMonthId(monthId);
  const lastDay = new Date(y, m, 0);
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return lastDay < startToday;
}

/** Current calendar month or the immediate next month — used to default-expand supply list on mobile. */
export function isMonthComingUpSoon(monthId: string, now: Date = new Date()): boolean {
  const { y, m } = parseYearMonthId(monthId);
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  if (y === cy && m === cm) return true;
  const next = new Date(cy, cm, 1);
  return y === next.getFullYear() && m === next.getMonth() + 1;
}

/**
 * Month the admin most recently updated that has a supply list (items.length > 0).
 * Falls back to the first month in {@link YEAR_PLAN} if none qualify.
 */
export function findAdminAnchorMonthId(months: Record<string, MonthPackage>): string {
  let bestId = YEAR_PLAN[0].id;
  let bestT = -1;
  for (const m of Object.values(months)) {
    if (!m.items.some((i) => i.name.trim())) continue;
    const t = m.lastUpdatedAt;
    const better = t > bestT || (t === bestT && m.id < bestId);
    if (better) {
      bestT = t;
      bestId = m.id;
    }
  }
  return bestId;
}

/** 12 month ids in chronological order starting at anchor (wraps within {@link YEAR_PLAN}). */
export function buildRollingMonthIds(anchorId: string): string[] {
  const idx = Math.max(
    0,
    YEAR_PLAN.findIndex((x) => x.id === anchorId)
  );
  const start = idx >= 0 ? idx : 0;
  return Array.from({ length: YEAR_PLAN.length }, (_, i) => YEAR_PLAN[(start + i) % YEAR_PLAN.length].id);
}

export const PROGRESS_STATUSES: Extract<MonthStatus, "Reserved" | "Ready" | "Completed">[] = [
  "Reserved",
  "Ready",
  "Completed",
];

export function isPublishedStatus(s: MonthStatus): boolean {
  return s !== "Draft";
}

export function isProgressStatus(s: MonthStatus): s is "Reserved" | "Ready" | "Completed" {
  return s === "Reserved" || s === "Ready" || s === "Completed";
}

/** 0 = not started (Available/Draft); 1–3 = Reserved → Ready → Completed */
export function getProgressStepLevel(s: MonthStatus): 0 | 1 | 2 | 3 {
  switch (s) {
    case "Reserved":
      return 1;
    case "Ready":
      return 2;
    case "Completed":
      return 3;
    default:
      return 0;
  }
}

/**
 * Short English summary for the delivery stepper (under the dots).
 */
export function getCardStepperSummary(m: MonthPackage): string {
  const g = m.cellGroup.trim();
  switch (m.status) {
    case "Reserved":
      return g ? `Reserved by ${g}` : "Reserved";
    case "Ready":
      return g ? `Prepared by ${g}` : "Prepared";
    case "Completed":
      return g ? `Completed by ${g}` : "Completed";
    case "Available":
    case "Draft":
      return "Not claimed yet — use Claim this month below";
    default:
      return "";
  }
}

/** Primary line shown on cards — high-signal copy */
export function getStatusHeadline(m: MonthPackage): string {
  const g = m.cellGroup.trim();
  switch (m.status) {
    case "Draft":
    case "Available":
      return "Open";
    case "Reserved":
      return g ? `Reserved by ${g} · 예약됨` : "Reserved · 예약됨";
    case "Ready":
      return g ? `준비완료 by ${g}` : "준비완료";
    case "Completed":
      return g ? `완료 by ${g}` : "완료";
    default:
      return "";
  }
}

/** Sort key: lower = show first for strategic picking (available first) */
export function statusSortPriority(s: MonthStatus): number {
  switch (s) {
    case "Available":
      return 0;
    case "Reserved":
      return 1;
    case "Ready":
      return 2;
    case "Completed":
      return 3;
    case "Draft":
      return 4;
    default:
      return 5;
  }
}

/** Staggered mock timestamps — September 2026 is the newest admin edit (roadmap anchor). */
const T = (iso: string) => Date.parse(iso);

export const initialMonths: Record<string, MonthPackage> = {
  "2026-05": baseMonth("2026-05", "May 2026", {
    items: itemsForMonth(0),
    dropLocation: HALL,
    dropDate: "Saturday, May 16, 2026",
    schedule: "Saturday 10:00 AM – 12:00 PM",
    status: "Available",
    lastUpdatedAt: T("2026-01-10T12:00:00"),
  }),
  "2026-06": baseMonth("2026-06", "June 2026", {
    items: itemsForMonth(1),
    dropLocation: HALL,
    dropDate: "Saturday, June 20, 2026",
    schedule: "Saturday 10:00 AM – 12:00 PM",
    status: "Reserved",
    cellGroup: "은혜샘터",
    pin: "4821",
    lastUpdatedAt: T("2026-01-15T12:00:00"),
  }),
  "2026-07": baseMonth("2026-07", "July 2026", {
    items: itemsForMonth(2),
    dropLocation: HALL,
    dropDate: "Saturday, July 18, 2026",
    schedule: "Saturday 10:00 AM – 12:00 PM",
    status: "Completed",
    cellGroup: "Cell Group 12",
    pin: "9900",
    lastUpdatedAt: T("2026-02-01T12:00:00"),
  }),
  "2026-08": baseMonth("2026-08", "August 2026", {
    items: [],
    dropLocation: "",
    dropDate: "",
    schedule: "",
    status: "Draft",
    lastUpdatedAt: 0,
  }),
  "2026-09": baseMonth("2026-09", "September 2026", {
    items: itemsForMonth(4),
    dropLocation: `${HALL} · Side entrance`,
    dropDate: "Saturday, September 19, 2026",
    schedule: "Saturday 9:30 AM – 11:30 AM",
    status: "Ready",
    cellGroup: "베다니",
    pin: "2211",
    lastUpdatedAt: T("2026-12-20T15:30:00"),
  }),
  "2026-10": baseMonth("2026-10", "October 2026", {
    items: [],
    status: "Draft",
    lastUpdatedAt: 0,
  }),
  "2026-11": baseMonth("2026-11", "November 2026", {
    items: itemsForMonth(6),
    dropLocation: HALL,
    dropDate: "Saturday, November 21, 2026",
    schedule: "Saturday 10:00 AM – 12:00 PM",
    status: "Reserved",
    cellGroup: "Cell Group 22",
    pin: "1155",
    lastUpdatedAt: T("2026-03-05T12:00:00"),
  }),
  "2026-12": baseMonth("2026-12", "December 2026", {
    items: itemsForMonth(7),
    dropLocation: HALL,
    dropDate: "Saturday, December 12, 2026",
    schedule: "Saturday 10:00 AM – 1:00 PM",
    status: "Available",
    lastUpdatedAt: T("2026-03-10T12:00:00"),
  }),
  "2027-01": baseMonth("2027-01", "January 2027", {
    items: [],
    status: "Draft",
    lastUpdatedAt: 0,
  }),
  "2027-02": baseMonth("2027-02", "February 2027", {
    items: itemsForMonth(9),
    dropLocation: HALL,
    dropDate: "Saturday, February 20, 2027",
    schedule: "Saturday 10:00 AM – 12:00 PM",
    status: "Available",
    lastUpdatedAt: T("2026-04-01T12:00:00"),
  }),
  "2027-03": baseMonth("2027-03", "March 2027", {
    items: itemsForMonth(10),
    dropLocation: HALL,
    dropDate: "Saturday, March 20, 2027",
    schedule: "Saturday 10:00 AM – 12:00 PM",
    status: "Reserved",
    cellGroup: "Cell Group 3",
    pin: "3030",
    lastUpdatedAt: T("2026-04-08T12:00:00"),
  }),
  "2027-04": baseMonth("2027-04", "April 2027", {
    items: [],
    status: "Draft",
    lastUpdatedAt: 0,
  }),
};
