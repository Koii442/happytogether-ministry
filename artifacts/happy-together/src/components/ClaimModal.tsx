import { useState } from "react";
import { SupplyItem, CELL_GROUPS } from "@/data/mockData";
import { useApp } from "@/context/AppContext";

interface ClaimModalProps {
  item: SupplyItem;
  onClose: () => void;
}

export function ClaimModal({ item, onClose }: ClaimModalProps) {
  const { claimItem } = useApp();
  const [cellGroup, setCellGroup] = useState("");
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState<{ cellGroup?: string; pin?: string }>({});
  const [success, setSuccess] = useState(false);

  const handleConfirm = () => {
    const newErrors: { cellGroup?: string; pin?: string } = {};
    if (!cellGroup) newErrors.cellGroup = "Please select a cell group.";
    if (!/^\d{4}$/.test(pin)) newErrors.pin = "PIN must be exactly 4 digits.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    claimItem(item.id, cellGroup, pin);
    setSuccess(true);
    setTimeout(() => onClose(), 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Decorative top bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-amber-400 to-primary" />

        <div className="p-6 space-y-5">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-foreground">Item Claimed!</p>
              <p className="text-sm text-muted-foreground">Your claim has been recorded.</p>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Claim Item</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Fill in your details to claim this supply item.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                  >
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Item info */}
              <div className="bg-muted/60 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{item.itemName}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>

              {/* Cell Group Select */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Cell Group <span className="text-destructive">*</span>
                </label>
                <select
                  value={cellGroup}
                  onChange={(e) => {
                    setCellGroup(e.target.value);
                    setErrors((p) => ({ ...p, cellGroup: undefined }));
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                >
                  <option value="">Select your cell group...</option>
                  {CELL_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.cellGroup && (
                  <p className="text-xs text-destructive">{errors.cellGroup}</p>
                )}
              </div>

              {/* PIN Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  4-Digit PIN <span className="text-destructive">*</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPin(val);
                    setErrors((p) => ({ ...p, pin: undefined }));
                  }}
                  placeholder="Enter 4-digit PIN"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all tracking-[0.3em] font-mono placeholder:tracking-normal placeholder:font-sans"
                />
                {errors.pin && (
                  <p className="text-xs text-destructive">{errors.pin}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                >
                  Confirm Claim
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
