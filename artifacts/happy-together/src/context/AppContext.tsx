import { createContext, useContext, useState, ReactNode } from "react";
import type { SupplyLineItem } from "@/data/mockData";
import {
  MonthPackage,
  MonthStatus,
  initialMonths,
  isProgressStatus,
} from "@/data/mockData";

export interface PublishMonthPayload {
  items: SupplyLineItem[];
  dropLocation: string;
  dropDate: string;
  schedule: string;
}

function credentialsMatch(m: MonthPackage, cellGroup: string, pin: string): boolean {
  return m.cellGroup.trim() === cellGroup.trim() && m.pin === pin;
}

interface AppContextValue {
  months: Record<string, MonthPackage>;
  claimMonth: (monthId: string, cellGroup: string, pin: string) => void;
  updateMonthProgress: (
    monthId: string,
    cellGroup: string,
    pin: string,
    next: Extract<MonthStatus, "Reserved" | "Ready" | "Completed">
  ) => boolean;
  publishMonth: (monthId: string, payload: PublishMonthPayload) => void;
  resetMonthToAvailable: (monthId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [months, setMonths] = useState<Record<string, MonthPackage>>(() => ({
    ...initialMonths,
  }));

  const claimMonth = (monthId: string, cellGroup: string, pin: string) => {
    const g = cellGroup.trim();
    if (!g) return;
    setMonths((prev) => {
      const cur = prev[monthId];
      /** Early reservation: unpublished (Draft) or open (Available) months */
      if (!cur || (cur.status !== "Available" && cur.status !== "Draft")) return prev;
      return {
        ...prev,
        [monthId]: {
          ...cur,
          status: "Reserved" as MonthStatus,
          cellGroup: g,
          pin,
        },
      };
    });
  };

  const updateMonthProgress = (
    monthId: string,
    cellGroup: string,
    pin: string,
    next: Extract<MonthStatus, "Reserved" | "Ready" | "Completed">
  ): boolean => {
    let success = false;
    setMonths((prev) => {
      const c = prev[monthId];
      if (!c || !isProgressStatus(c.status)) return prev;
      if (!credentialsMatch(c, cellGroup, pin)) return prev;
      success = true;
      return {
        ...prev,
        [monthId]: {
          ...c,
          status: next,
        },
      };
    });
    return success;
  };

  const publishMonth = (monthId: string, payload: PublishMonthPayload) => {
    const cleaned = payload.items
      .map((r) => ({ name: r.name.trim(), quantity: r.quantity.trim() }))
      .filter((r) => r.name.length > 0);
    setMonths((prev) => {
      const cur = prev[monthId];
      if (!cur) return prev;
      const wasDraft = cur.status === "Draft";
      /** Unclaimed Draft → Available when published. Reserved (incl. early claim) keeps group + PIN. */
      return {
        ...prev,
        [monthId]: {
          ...cur,
          items: cleaned,
          dropLocation: payload.dropLocation.trim(),
          dropDate: payload.dropDate.trim(),
          schedule: payload.schedule.trim(),
          status: wasDraft ? ("Available" as MonthStatus) : cur.status,
          cellGroup: wasDraft ? "" : cur.cellGroup,
          pin: wasDraft ? "" : cur.pin,
          lastUpdatedAt: Date.now(),
        },
      };
    });
  };

  const resetMonthToAvailable = (monthId: string) => {
    setMonths((prev) => {
      const cur = prev[monthId];
      if (!cur || cur.status === "Draft" || cur.status === "Available") return prev;
      return {
        ...prev,
        [monthId]: {
          ...cur,
          status: "Available" as MonthStatus,
          cellGroup: "",
          pin: "",
        },
      };
    });
  };

  return (
    <AppContext.Provider
      value={{ months, claimMonth, updateMonthProgress, publishMonth, resetMonthToAvailable }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
