import { FileText } from "lucide-react"
import { type Transaction } from "@/services/paymentHistory/payment-history-service"

interface TransactionCardProps {
  tx: Transaction
  onExportPDF: (tx: Transaction) => void
}

export default function TransactionCard({ tx, onExportPDF }: TransactionCardProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">Session with {tx.tutorName}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {tx.subject} · {tx.duration >= 60 ? `${tx.duration / 60}h` : `${tx.duration}min`}
          </p>
        </div>
        <p className="text-sm font-bold text-gray-800 ml-4">
          {tx.currency}{Number(tx.amount).toFixed(2)}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-400">{tx.date}</p>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
            tx.status === "Completed" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${tx.status === "Completed" ? "bg-green-500" : "bg-yellow-500"}`} />
            {tx.status}
          </span>
          <button onClick={() => onExportPDF(tx)}>
            <FileText size={16} className="text-indigo-400 hover:text-indigo-600" />
          </button>
        </div>
      </div>
    </div>
  )
}