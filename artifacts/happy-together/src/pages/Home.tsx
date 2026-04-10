import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { SupplyItem } from "@/data/mockData";
import { KWCALogo } from "@/components/KWCALogo";
import { StatusBadge } from "@/components/StatusBadge";
import { ClaimModal } from "@/components/ClaimModal";
import { Link } from "wouter";

function DropInfoCard() {
  const { dropInfo, items } = useApp();
  const available = items.filter((i) => i.status === "Available").length;
  const claimed = items.filter((i) => i.status === "Claimed").length;
  const completed = items.filter((i) => i.status === "Completed").length;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-orange-500 to-amber-500 text-white shadow-lg">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-black/10 translate-y-1/2 -translate-x-1/4" />

      <div className="relative p-6 md:p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white/70 text-xs font-medium uppercase tracking-widest">This Month's Drop</span>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white/70 text-xs uppercase tracking-wide font-medium">Location</span>
            </div>
            <p className="text-white font-semibold text-sm leading-tight">{dropInfo.dropLocation}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-white/70 text-xs uppercase tracking-wide font-medium">Date</span>
            </div>
            <p className="text-white font-semibold text-sm">{dropInfo.dropDate}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white/70 text-xs uppercase tracking-wide font-medium">Schedule</span>
            </div>
            <p className="text-white font-semibold text-sm">{dropInfo.dropSchedule}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-4 border-t border-white/20 flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{available}</p>
            <p className="text-white/70 text-xs mt-0.5">Available</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{claimed}</p>
            <p className="text-white/70 text-xs mt-0.5">Claimed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{completed}</p>
            <p className="text-white/70 text-xs mt-0.5">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemCard({
  item,
  onClaim,
}: {
  item: SupplyItem;
  onClaim: (item: SupplyItem) => void;
}) {
  const isCompleted = item.status === "Completed";
  const isClaimed = item.status === "Claimed";

  return (
    <div
      className={`bg-card border rounded-xl p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md group ${
        isCompleted ? "opacity-60" : "hover:-translate-y-0.5"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isCompleted
            ? "bg-gray-100"
            : isClaimed
            ? "bg-amber-50"
            : "bg-blue-50"
        }`}
      >
        <svg
          className={`w-5 h-5 ${
            isCompleted ? "text-gray-400" : isClaimed ? "text-amber-500" : "text-blue-500"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold text-sm leading-tight truncate ${
            isCompleted ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {item.itemName}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Qty: {item.quantity}
          {item.cellGroup && ` · ${item.cellGroup}`}
        </p>
      </div>

      {/* Status & Action */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <StatusBadge status={item.status} />
        {item.status === "Available" && (
          <button
            onClick={() => onClaim(item)}
            className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 active:scale-[0.97] transition-all shadow-sm"
          >
            Claim
          </button>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { items } = useApp();
  const [selectedItem, setSelectedItem] = useState<SupplyItem | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/60">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KWCALogo size={36} />
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">KWCA</h1>
              <p className="text-xs text-muted-foreground leading-tight">Korean Women's Association</p>
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

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">
            Mission Facility Supplies
          </h2>
          <p className="text-muted-foreground text-sm">
            Browse available items and claim what your cell group needs. Items are distributed monthly.
          </p>
        </div>

        {/* Drop Info Card */}
        <DropInfoCard />

        {/* Item List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              Supply Items
            </h3>
            <span className="text-xs text-muted-foreground">
              {items.length} items total
            </span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-muted-foreground text-sm">No items published yet.</p>
              <p className="text-xs text-muted-foreground">Check back after the admin publishes this month's list.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClaim={setSelectedItem}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Claim Modal */}
      {selectedItem && (
        <ClaimModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-border/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Korean Women's Association (KWCA) · Mission Facility Supply Manager
          </p>
        </div>
      </footer>
    </div>
  );
}
