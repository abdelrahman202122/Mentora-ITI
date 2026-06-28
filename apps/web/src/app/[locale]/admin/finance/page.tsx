
"use client";

import { useState } from "react";
import { Download, DollarSign, Percent, Clock, CheckCircle2 } from "lucide-react";
import { TransactionsTable } from "@/components/admin/finance/components/TransactionsTable";
import { WithdrawalsTable } from "@/components/admin/finance/components/WithdrawalsTable";
import { TRANSACTIONS, WITHDRAWALS, TOTAL_TX, PER_PAGE, COMMISSION_RATE } from "@/mocks/mock-data";
import { PageHeader, StatCard } from "@/components/admin/shared";

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

const grossRevenue = TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0);
const platformCommission = TRANSACTIONS.reduce((sum, t) => sum + (t.commission ?? t.amount * COMMISSION_RATE), 0);
const pendingWithdrawalsList = WITHDRAWALS.filter((w) => w.status === "PENDING");
const pendingAmount = pendingWithdrawalsList.reduce((sum, w) => sum + w.requestedAmount, 0);
const pendingCount = pendingWithdrawalsList.length;
const completedPayouts = TRANSACTIONS.filter((t) => t.status === "COMPLETED").reduce((sum, t) => sum + (t.amount - t.commission), 0);

export default function FinancePage() {
  const [tab, setTab] = useState<"transactions" | "withdrawals">("transactions");
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(TOTAL_TX / PER_PAGE));

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <PageHeader
          title="Finance & Payments"
          description="Oversee global revenue flow and manage tutor withdrawal requests."
          actions={
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              <Download className="h-4 w-4" />Export Report
            </button>
          }
        />

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Gross Revenue" value={fmtUSD(grossRevenue)} subtext={`${TRANSACTIONS.length} transactions processed`} icon={DollarSign} iconBg="bg-blue-500/10" iconColor="text-blue-600" />
          <StatCard label="Platform Commission" value={fmtUSD(platformCommission)} subtext={`Fixed ${(COMMISSION_RATE * 100).toFixed(0)}% rate applied`} icon={Percent} iconBg="bg-purple-500/10" iconColor="text-purple-600" />
          <StatCard label="Pending Withdrawals" value={fmtUSD(pendingAmount)} subtext={pendingCount === 0 ? "No requests awaiting approval" : `${pendingCount} request${pendingCount === 1 ? "" : "s"} awaiting approval`} subtextClassName="text-red-600" valueClassName="text-red-600" icon={Clock} iconBg="bg-red-500/10" iconColor="text-red-600" />
          <StatCard label="Completed Payouts" value={fmtUSD(completedPayouts)} subtext="Payout cycle: Bi-weekly" icon={CheckCircle2} iconBg="bg-emerald-500/10" iconColor="text-emerald-600" />
        </div>

        {/* Tabs */}
        <div className="mb-4 flex items-center gap-6 border-b border-gray-200">
          <button type="button" onClick={() => setTab("transactions")}
            className={`-mb-px border-b-2 pb-2 text-sm font-medium transition-colors ${tab === "transactions" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            Transactions
          </button>
          <button type="button" onClick={() => setTab("withdrawals")}
            className={`-mb-px border-b-2 pb-2 text-sm font-medium transition-colors ${tab === "withdrawals" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            Withdrawal Requests
          </button>
        </div>

        {tab === "transactions" ? (
          <TransactionsTable transactions={TRANSACTIONS} page={page} totalPages={totalPages} onPageChange={setPage} totalTx={TOTAL_TX} perPage={PER_PAGE} />
        ) : (
          <WithdrawalsTable withdrawals={WITHDRAWALS} />
        )}
      </div>
    </div>
  );
}