
import { CheckCircle2, Clock, RefreshCw, XCircle, CreditCard } from "lucide-react";
import type { PaymentStatus } from "@/types/admin";

const PAYMENT_BADGE: Record<PaymentStatus, { classes: string; icon: typeof CheckCircle2 }> = {
  PAID: { classes: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200", icon: CheckCircle2 },
  PENDING: { classes: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200", icon: Clock },
  REFUNDED: { classes: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200", icon: RefreshCw },
  FAILED: { classes: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200", icon: XCircle },
};

export function PaymentCell({ payment, method }: { payment: PaymentStatus; method?: string }) {
  const cfg = PAYMENT_BADGE[payment];
  const Icon = cfg.icon;
  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${cfg.classes}`}>
        <Icon className="h-3 w-3" />{payment}
      </span>
      {method && (
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
          <CreditCard className="h-3 w-3" />{method}
        </span>
      )}
    </div>
  );
}
