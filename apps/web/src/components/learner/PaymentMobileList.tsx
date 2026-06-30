import { FileText } from "lucide-react";
import { Payment } from "@/services/payment/paymentHistory";

interface PaymentMobileListProps {
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

  StatusBadge: React.ComponentType<{
    status: Payment["status"];
  }>;
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
  if (loading || error) return null;

  return (
    <div className="md:hidden">
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No transactions found.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {currentPayments.map((payment) => {
            const { title, subtitle } = getDescription(payment);

            return (
              <div
                key={payment._id}
                onClick={() => handleRowClick(payment)}
                className="p-4 space-y-2 cursor-pointer hover:bg-gray-50/50 transition-colors"
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
                    {payment.currency}
                    {payment.amount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {formatDate(payment.paidAt ?? payment.createdAt)}
                  </span>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={payment.status} />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportInvoice(payment);
                      }}
                      className="text-indigo-400 hover:text-indigo-600 transition-colors"
                      title="Download invoice"
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