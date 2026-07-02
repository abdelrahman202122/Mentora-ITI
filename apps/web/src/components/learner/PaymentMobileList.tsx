
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Payment } from "@/services/payment/paymentHistory";

interface PaymentMobileListProps {
  loading: boolean;
  error: string | null;
  filtered: Payment[];
  currentPayments: Payment[];
  formatDate: (date: string | null) => string;
  getDescription: (payment: Payment) => { title: string; subtitle: string };
  handleRowClick: (payment: Payment) => void;
  handleExportInvoice: (payment: Payment) => void;
  StatusBadge: React.ComponentType<{ status: Payment["status"] }>;
}

export default function PaymentMobileList({
  loading,
  error,
  filtered,
  currentPayments,
  formatDate,
  getDescription,
  handleRowClick,
  handleExportInvoice,
  StatusBadge,
}: PaymentMobileListProps) {
  const t = useTranslations("Payments");

  if (loading || error) return null;

  return (
    <div className="md:hidden">
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {t("noTransactions")}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {currentPayments.map((payment) => {
            const { title, subtitle } = getDescription(payment);

            return (
              <div
                key={payment._id}
                role="button"
                tabIndex={0}
                aria-label={t("viewDetailsFor", { title })}
                onClick={() => handleRowClick(payment)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRowClick(payment);
                  }
                }}
                className="p-4 space-y-2 cursor-pointer hover:bg-gray-50/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-inset"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {title}
                    </p>

                    {subtitle && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  <span className="font-semibold text-gray-800 text-sm shrink-0">
                    EGP {payment.amount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {formatDate(payment.paidAt ?? payment.createdAt)}
                  </span>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={payment.status} />

                   =<button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportInvoice(payment);
                      }}
                      aria-label={t("downloadInvoiceFor", { title })}
                      className="text-indigo-400 hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:rounded"
                    >
                      <FileText size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
