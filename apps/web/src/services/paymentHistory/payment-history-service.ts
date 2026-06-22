export type Transaction = {
  id: string
  date: string
  tutorName: string
  subject: string
  amount: number
  currency: string
  duration: number
  status: "Completed" | "Pending"
}

export function saveTransaction(tx: Transaction) {
  const existing = getTransactions()
  const updated = [tx, ...existing]
  localStorage.setItem("mentora_transactions", JSON.stringify(updated))
}

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("mentora_transactions")
  if (!data) return []
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}