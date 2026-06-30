// "use client"
// import { Wallet, CreditCard } from "lucide-react";

// import PageHeader from "@/components/payment/BaymentHeader";
// import StatsCard from "@/components/payment/StatesCard";
// import PendingPayoutCard from "@/components/payment/PendingPayoutCard";
// import TransactionsTable from "@/components/payment/FinancialOverview";

// export default function PaymentsPage() {
//   return (
//     <div className="min-h-screen bg-background">
//       <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">

//         {/* Header */}
//         <PageHeader />

//         {/* Statistics */}
//         <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//           <StatsCard
//             title="Total Revenue"
//             value="$4,250.00"
//             icon={Wallet}
//             badge="+12%"
//             progress={80}
//           />

//           <StatsCard
//             title="Net Income"
//             value="$3,612.50"
//             icon={CreditCard}
//             description="After 15% platform fees"
//           />

//           <PendingPayoutCard
//             amount="$425.00"
//             availableDate="Oct 30, 2023"
//           />
//         </section>

//         {/* Transactions */}
//         <TransactionsTable />
//       </div>
//     </div>
//   );
// }

"use client";

import { Wallet, CreditCard, Clock } from "lucide-react";
import PageHeader from "@/components/payment/BaymentHeader";
import StatCard from "@/components/payment/StatesCard";
import PendingPayoutCard from "@/components/payment/PendingPayoutCard";
import TransactionsTable from "@/components/payment/FinancialOverview";
import { useEarningsSummary } from "@/hooks/earning/useGetEarningSummery";

function formatAmount(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export default function PaymentsPage() {
const { data, isLoading, isError } = useEarningsSummary();

const hasSummary = !isLoading && !isError && !!data;


  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">

        <PageHeader />

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StatCard
            title="Available Balance"
            icon={Wallet}
            value={isLoading ? "—" : hasSummary ? formatAmount(data.available.totalAmount) : "Unavailable"}
            description={hasSummary ? `${data.available.count} sessions` : "—"}
          />

          <StatCard
            title="Paid Out"
            icon={CreditCard}
            value={isLoading ? "—" : hasSummary ? formatAmount(data.paid_out.totalAmount) : "Unavailable"}
            description={hasSummary ? `${data.paid_out.count} sessions` : "—"}
          />

          <PendingPayoutCard
            amount={isLoading ? "—" : hasSummary ? formatAmount(data.pending.totalAmount) : "Unavailable"}
            count={hasSummary ? data.pending.count : 0}
          />

        </section>

        <TransactionsTable />
      </div>
    </div>
  );
}