import { cn } from "@/lib/utils";

const LABELS = ["Reserved", "Prepared", "Complete"] as const;

type NodeState = "done" | "active" | "todo";

/** Drives badge + dot colors: Open = grey; Reserved = orange; Ready = teal; Completed = green */
export type StepperTone = "open" | "reserved" | "ready" | "completed";

function nodeState(index: 0 | 1 | 2, step: 0 | 1 | 2 | 3): NodeState {
  if (step === 0) return "todo";
  if (step === 3) return "done";
  if (index < step - 1) return "done";
  if (index === step - 1) return "active";
  return "todo";
}

function Dot({
  state,
  index,
  tone,
}: {
  state: NodeState;
  index: 0 | 1 | 2;
  tone: StepperTone;
}) {
  const isOpen = tone === "open";

  const className = cn(
    "relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500",
    isOpen && "border-neutral-400/50 bg-neutral-100 text-neutral-500",
    !isOpen &&
      state === "todo" &&
      "border-muted-foreground/35 bg-muted/50 text-muted-foreground",
    !isOpen &&
      state === "done" &&
      tone === "completed" &&
      "border-emerald-600 bg-emerald-600 text-white shadow-md scale-100",
    !isOpen &&
      state === "done" &&
      tone === "ready" &&
      index === 0 &&
      "border-amber-500 bg-amber-500 text-white shadow-md scale-100",
    !isOpen &&
      state === "active" &&
      tone === "reserved" &&
      "border-amber-500 bg-amber-500 text-white shadow-lg ring-4 ring-amber-300/50 scale-110",
    !isOpen &&
      state === "active" &&
      tone === "ready" &&
      index === 1 &&
      "border-teal-600 bg-teal-600 text-white shadow-lg ring-4 ring-teal-300/45 scale-110"
  );

  const showCheck = state === "done" && !isOpen;

  return (
    <div className={className} aria-hidden>
      {showCheck ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span className="text-xs font-bold tabular-nums">{index + 1}</span>
      )}
    </div>
  );
}

function Connector({
  filled,
  fillClassName,
}: {
  filled: boolean;
  fillClassName?: string;
}) {
  return (
    <div className="relative h-1.5 min-w-[12px] flex-1 mx-1 self-center rounded-full bg-muted/80 overflow-hidden">
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out",
          filled ? "w-full" : "w-0",
          fillClassName
        )}
      />
    </div>
  );
}

function connectorFill(tone: StepperTone, step: 0 | 1 | 2 | 3, segment: 0 | 1): string | undefined {
  const seg1Full = step >= 2;
  const seg2Full = step >= 3;
  const filled = segment === 0 ? seg1Full : seg2Full;
  if (!filled) return undefined;
  if (tone === "completed") return "bg-gradient-to-r from-emerald-500 to-emerald-600";
  if (tone === "ready" && segment === 0) return "bg-gradient-to-r from-amber-500 to-teal-500";
  return "bg-amber-500";
}

export interface CardDeliveryStepperProps {
  step: 0 | 1 | 2 | 3;
  summary: string;
  tone: StepperTone;
  className?: string;
}

export function CardDeliveryStepper({ step, summary, tone, className }: CardDeliveryStepperProps) {
  const isOpen = tone === "open";
  const seg1Full = step >= 2;
  const seg2Full = step >= 3;

  const n0: NodeState = isOpen ? "todo" : nodeState(0, step);
  const n1: NodeState = isOpen ? "todo" : nodeState(1, step);
  const n2: NodeState = isOpen ? "todo" : nodeState(2, step);

  const fill1 = connectorFill(tone, step, 0);
  const fill2 = connectorFill(tone, step, 1);

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-3 shadow-sm",
        isOpen
          ? "border-dashed border-neutral-300/90 bg-muted/30 shadow-none"
          : "border-border/60 bg-background/95",
        className
      )}
    >
      <p
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider mb-3 text-center",
          isOpen ? "text-neutral-500" : "text-muted-foreground"
        )}
      >
        Sponsorship progress
      </p>

      <div className="flex items-center w-full">
        <Dot state={n0} index={0} tone={tone} />
        <Connector filled={!isOpen && seg1Full} fillClassName={fill1} />
        <Dot state={n1} index={1} tone={tone} />
        <Connector filled={!isOpen && seg2Full} fillClassName={fill2} />
        <Dot state={n2} index={2} tone={tone} />
      </div>

      <div className="grid grid-cols-3 gap-1 mt-2 text-center">
        {LABELS.map((label) => (
          <span
            key={label}
            className="text-[10px] font-semibold leading-tight text-muted-foreground px-0.5"
          >
            {label}
          </span>
        ))}
      </div>

      <p
        className={cn(
          "mt-3 text-center text-sm font-extrabold leading-snug tracking-tight",
          isOpen ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {summary}
      </p>
    </div>
  );
}
