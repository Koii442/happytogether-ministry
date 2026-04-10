import { useState, useEffect, useMemo } from "react";
import { MonthPackage, PROGRESS_STATUSES, countSupplyItems } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import type { MonthStatus } from "@/data/mockData";

type ProgressStep = Extract<MonthStatus, "Reserved" | "Ready" | "Completed">;

const STEP_META: Record<
  ProgressStep,
  { en: string; ko: string; short: string }
> = {
  Reserved: { en: "Reserved", ko: "예약됨", short: "1" },
  Ready: { en: "Ready", ko: "준비완료", short: "2" },
  Completed: { en: "Completed", ko: "완료", short: "3" },
};

interface ClaimModalProps {
  month: MonthPackage;
  onClose: () => void;
}

function ProgressStepper({
  current,
  onSelect,
  disabled,
}: {
  current: ProgressStep;
  onSelect: (s: ProgressStep) => void;
  disabled: boolean;
}) {
  const currentIndex = PROGRESS_STATUSES.indexOf(current);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Progress</p>
      <ol className="flex flex-col gap-2">
        {PROGRESS_STATUSES.map((step, idx) => {
          const active = current === step;
          const done = currentIndex > idx;
          const meta = STEP_META[step];
          return (
            <li key={step}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(step)}
                className={`w-full flex items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm"
                    : done
                      ? "border-emerald-300 bg-emerald-50/80 text-emerald-950"
                      : "border-border bg-muted/40 hover:bg-muted/70 text-foreground"
                } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-emerald-600 text-white"
                        : "bg-background border-2 border-border text-muted-foreground"
                  }`}
                >
                  {done && !active ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    meta.short
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-foreground leading-tight">{meta.en}</span>
                  <span className="block text-xs text-muted-foreground font-medium">{meta.ko}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="text-[11px] text-muted-foreground leading-snug">
        Tap a step to update status. Your group name and PIN must match what you used when you first reserved this month.
      </p>
    </div>
  );
}

export function ClaimModal({ month, onClose }: ClaimModalProps) {
  const { claimMonth, updateMonthProgress, months } = useApp();
  const live = useMemo(() => months[month.id] ?? month, [months, month.id, month]);
  const [cellGroup, setCellGroup] = useState("");
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState<{ cellGroup?: string; pin?: string }>({});
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [authUnlocked, setAuthUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");

  // Reset only when switching to another month card (not when status updates from the stepper).
  useEffect(() => {
    const m = months[month.id] ?? month;
    setCellGroup(m.status !== "Available" && m.status !== "Draft" ? m.cellGroup : "");
    setPin("");
    setErrors({});
    setClaimSuccess(false);
    setAuthUnlocked(false);
    setAuthError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-init when the selected card changes
  }, [month.id]);

  const handleClaim = () => {
    const newErrors: { cellGroup?: string; pin?: string } = {};
    if (!cellGroup.trim()) newErrors.cellGroup = "Enter your cell group name.";
    if (!/^\d{4}$/.test(pin)) newErrors.pin = "PIN must be exactly 4 digits.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    claimMonth(live.id, cellGroup.trim(), pin);
    setClaimSuccess(true);
    setTimeout(() => onClose(), 1400);
  };

  const tryUnlockProgress = () => {
    setAuthError("");
    if (!cellGroup.trim() || !/^\d{4}$/.test(pin)) {
      setAuthError("Enter the same group name and 4-digit PIN you used when reserving this month.");
      return;
    }
    if (live.cellGroup.trim() !== cellGroup.trim() || live.pin !== pin) {
      setAuthError("Group name or PIN doesn’t match our records.");
      return;
    }
    setAuthUnlocked(true);
  };

  const handleStepSelect = (next: ProgressStep) => {
    setAuthError("");
    const ok = updateMonthProgress(live.id, cellGroup, pin, next);
    if (!ok) setAuthError("Could not update. Check your group name and PIN.");
  };

  if (live.status === "Available" || live.status === "Draft") {
    const isDraftReserve = live.status === "Draft";
    return (
      <ModalShell onClose={onClose}>
        <div className="h-1.5 bg-gradient-to-r from-primary via-amber-400 to-primary" />
        <div className="p-6 space-y-5">
          {claimSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-foreground">Reserved · 예약됨</p>
              <p className="text-sm text-muted-foreground">This month is now held for your group. You can update progress anytime from the card.</p>
            </div>
          ) : (
            <>
              <ModalHeader
                title="Reserve this month"
                subtitle={
                  isDraftReserve
                    ? "Items for this month will be updated soon, but you can reserve the date now with your group name and PIN."
                    : `Reserve ${live.label} with your cell group name and a 4-digit PIN.`
                }
                onClose={onClose}
              />
              <div className="bg-muted/60 rounded-xl p-4 space-y-1">
                <p className="font-semibold text-foreground text-sm">{live.label}</p>
                <p className="text-xs text-muted-foreground">
                  {isDraftReserve ? (
                    <>Item list pending · drop details added when published</>
                  ) : (
                    <>
                      {countSupplyItems(live)} items · {live.dropDate || "TBD"}
                    </>
                  )}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Cell group name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={cellGroup}
                  onChange={(e) => {
                    setCellGroup(e.target.value);
                    setErrors((p) => ({ ...p, cellGroup: undefined }));
                  }}
                  placeholder="Type your group name (e.g. 은혜샘터)"
                  autoComplete="organization"
                  className="w-full h-10 px-3 rounded-lg border-2 border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                {errors.cellGroup && <p className="text-xs text-destructive">{errors.cellGroup}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Create a 4-digit PIN <span className="text-destructive">*</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ""));
                    setErrors((p) => ({ ...p, pin: undefined }));
                  }}
                  placeholder="4-digit PIN (save this for updates)"
                  className="w-full h-10 px-3 rounded-lg border-2 border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all tracking-[0.3em] font-mono placeholder:tracking-normal placeholder:font-sans"
                />
                {errors.pin && <p className="text-xs text-destructive">{errors.pin}</p>}
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-10 rounded-lg border-2 border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClaim}
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 shadow-sm"
                >
                  {isDraftReserve ? "Claim this month" : "Reserve month"}
                </button>
              </div>
            </>
          )}
        </div>
      </ModalShell>
    );
  }

  const progress = live.status as ProgressStep;

  return (
    <ModalShell onClose={onClose}>
      <div className="h-1.5 bg-gradient-to-r from-primary via-amber-400 to-primary" />
      <div className="p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <ModalHeader
          title={live.label}
          subtitle="Sign in with the group name and PIN you used when you reserved this month."
          onClose={onClose}
        />

        {!authUnlocked ? (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Cell group name</label>
              <input
                type="text"
                value={cellGroup}
                onChange={(e) => {
                  setCellGroup(e.target.value);
                  setAuthError("");
                }}
                placeholder="Same name as when you reserved"
                className="w-full h-10 px-3 rounded-lg border-2 border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">4-digit PIN</label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ""));
                  setAuthError("");
                }}
                placeholder="••••"
                className="w-full h-10 px-3 rounded-lg border-2 border-input bg-background text-sm tracking-[0.3em] font-mono"
              />
            </div>
            {authError && (
              <p className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {authError}
              </p>
            )}
            <button
              type="button"
              onClick={tryUnlockProgress}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:opacity-95"
            >
              Continue to progress
            </button>
          </>
        ) : (
          <>
            <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-center">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">Signed in</p>
              <p className="text-sm font-bold text-foreground truncate">{cellGroup.trim()}</p>
            </div>
            <ProgressStepper current={progress} onSelect={handleStepSelect} disabled={false} />
            {authError && <p className="text-xs text-destructive font-medium">{authError}</p>}
            <button
              type="button"
              onClick={() => setAuthUnlocked(false)}
              className="w-full text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Sign out (lock progress controls)
            </button>
          </>
        )}
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-2 border-border">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
        aria-label="Close"
      >
        <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
