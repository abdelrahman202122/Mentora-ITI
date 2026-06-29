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
  const { data, isLoading } = useEarningsSummary();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">

        <PageHeader />

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StatCard
            title="Available Balance"
            icon={Wallet}
            value={isLoading ? "—" : formatAmount(data?.available.totalAmount ?? 0)}
            description={`${data?.available.count ?? 0} sessions`}
          />

          <StatCard
            title="Paid Out"
            icon={CreditCard}
            value={isLoading ? "—" : formatAmount(data?.paid_out.totalAmount ?? 0)}
            description={`${data?.paid_out.count ?? 0} sessions`}
          />

          <PendingPayoutCard
            amount={isLoading ? "—" : formatAmount(data?.pending.totalAmount ?? 0)}
            count={data?.pending.count ?? 0}
          />
        </section>

        <TransactionsTable />
      </div>
    </div>
  );
}