import { FileText } from "lucide-react";
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
  if (loading || error) return null;

  return (
    <div className="hidden md:block">
      <div className="grid grid-cols-[120px_1fr_140px_140px_80px] px-5 py-3 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-50">
        <span>Date</span>
        <span>Description</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Status</span>
        <span className="text-right">Invoice</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No transactions found.
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {currentPayments.map((payment) => {
            const { title, subtitle } = getDescription(payment);

            return (
              <div
                key={payment._id}
                onClick={() => handleRowClick(payment)}
                className="grid grid-cols-[120px_1fr_140px_140px_80px] px-5 py-4 items-center hover:bg-gray-50/50 transition-colors cursor-pointer"
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
                    title="Download invoice"
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