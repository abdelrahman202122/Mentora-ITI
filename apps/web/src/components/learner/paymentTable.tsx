

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Payment } from "@/services/payment/paymentHistory";

interface PaymentTableProps {
  loading: boolean;
  error: string | null;
  filtered: Payment[];
  currentPayments: Payment[];
  formatDate: (date: string | null) => string;
  getDescription: (
    payment: Payment
  ) => {
    title: string;
    subtitle: string;
  };
  handleRowClick: (payment: Payment) => void;
  handleExportInvoice: (payment: Payment) => void;
  StatusBadge: React.ComponentType<{ status: Payment["status"] }>;
}

export default function PaymentTable({
  loading,
  error,
  filtered,
  currentPayments,
  formatDate,
  getDescription,
  handleRowClick,
  handleExportInvoice,
  StatusBadge,
}: PaymentTableProps) {
  const t = useTranslations("Payments");

  if (loading || error) return null;

  return (
    <div className="hidden md:block">
      <div className="grid grid-cols-[120px_1fr_140px_140px_80px] px-5 py-3 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-50">
        <span>{t("table.date")}</span>
        <span>{t("table.description")}</span>
        <span className="text-right">{t("table.amount")}</span>
        <span className="text-right">{t("table.status")}</span>
        <span className="text-right">{t("table.invoice")}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {t("noTransactions")}
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
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
                  if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
                    e.preventDefault();
                    handleRowClick(payment);
                  }
                }}
                className="grid grid-cols-[120px_1fr_140px_140px_80px] px-5 py-4 items-center hover:bg-gray-50/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 rounded-lg"
              >
                <span className="text-sm text-gray-500">
                  {formatDate(payment.paidAt ?? payment.createdAt)}
                </span>

                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {title}
                  </p>

                  {subtitle && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>

                <span className="text-right text-sm font-semibold text-gray-800">
                  {payment.currency}
                  {payment.amount.toFixed(2)}
                </span>

                <span className="flex justify-end">
                  <StatusBadge status={payment.status} />
                </span>

                <span className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportInvoice(payment);
                    }}
                    className="text-indigo-400 hover:text-indigo-600 transition-colors"
                    title={t("downloadInvoice")}
                  >
                    <FileText size={18} />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}