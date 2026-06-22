import { FileText } from "lucide-react"
import { type Transaction } from "@/services/paymentHistory/payment-history-service"

interface TransactionRowProps {
  tx: Transaction
  onExportPDF: (tx: Transaction) => void
}

export default function TransactionRow({ tx, onExportPDF }: TransactionRowProps) {
  return (
    <div className="grid grid-cols-6 items-center px-5 py-4 hover:bg-gray-50 transition-colors">
      <p className="text-sm text-gray-500">{tx.date}</p>

      <div className="col-span-2">
        <p className="text-sm font-semibold text-gray-800">Session with {tx.tutorName}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {tx.subject} · {tx.duration >= 60 ? `${tx.duration / 60}h` : `${tx.duration}min`}
        </p>
      </div>

      <p className="text-sm font-semibold text-gray-800 text-right">
        {tx.currency}{Number(tx.amount).toFixed(2)}
      </p>

      <div className="flex justify-end">
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
          tx.status === "Completed" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tx.status === "Completed" ? "bg-green-500" : "bg-yellow-500"}`} />
          {tx.status}
        </span>
      </div>

      <div className="flex justify-end ">
        <button onClick={() => onExportPDF(tx)}>
          <FileText size={18} className="text-indigo-400 hover:text-indigo-600 cursor-pointer" />
        </button>
      </div>
    </div>
  )
}