import { createContext, useContext, useState, ReactNode } from "react";
import {
  SupplyItem,
  DropInfo,
  initialItems,
  initialDropInfo,
} from "@/data/mockData";

interface AppContextValue {
  items: SupplyItem[];
  dropInfo: DropInfo;
  claimItem: (id: string, cellGroup: string, pin: string) => void;
  updateDropInfo: (info: DropInfo) => void;
  publishList: (newItems: { itemName: string; quantity: number }[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SupplyItem[]>(initialItems);
  const [dropInfo, setDropInfo] = useState<DropInfo>(initialDropInfo);

  const claimItem = (id: string, cellGroup: string, pin: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Claimed", cellGroup, pin } : item
      )
    );
  };

  const updateDropInfo = (info: DropInfo) => {
    setDropInfo(info);
  };

  const publishList = (newItems: { itemName: string; quantity: number }[]) => {
    const now = new Date();
    const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" });
    const filtered = newItems.filter((i) => i.itemName.trim() !== "");
    const created: SupplyItem[] = filtered.map((i, idx) => ({
      id: `pub-${Date.now()}-${idx}`,
      month: monthLabel,
      itemName: i.itemName,
      quantity: i.quantity,
      status: "Available",
      cellGroup: "",
      pin: "",
      dropLocation: dropInfo.dropLocation,
      dropDate: dropInfo.dropDate,
      dropSchedule: dropInfo.dropSchedule,
    }));
    setItems(created);
  };

  return (
    <AppContext.Provider value={{ items, dropInfo, claimItem, updateDropInfo, publishList }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
