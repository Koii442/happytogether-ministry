import { ItemStatus } from "@/data/mockData";

const styles: Record<ItemStatus, string> = {
  Available:
    "bg-blue-50 text-blue-700 border border-blue-200 ring-1 ring-blue-100",
  Claimed:
    "bg-amber-50 text-amber-700 border border-amber-200 ring-1 ring-amber-100",
  Completed:
    "bg-gray-100 text-gray-400 border border-gray-200 ring-1 ring-gray-100 line-through",
};

const dots: Record<ItemStatus, string> = {
  Available: "bg-blue-500",
  Claimed: "bg-amber-500",
  Completed: "bg-gray-400",
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[status]}`} />
      {status}
    </span>
  );
}
