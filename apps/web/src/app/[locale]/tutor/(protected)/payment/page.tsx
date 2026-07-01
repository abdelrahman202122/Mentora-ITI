
// "use client";

// import { Wallet, CreditCard, Clock } from "lucide-react";
// import PageHeader from "@/components/payment/BaymentHeader";
// import StatCard from "@/components/payment/StatesCard";
// import PendingPayoutCard from "@/components/payment/PendingPayoutCard";
// import TransactionsTable from "@/components/payment/FinancialOverview";
// import { useEarningsSummary } from "@/hooks/earning/useGetEarningSummery";

// function formatAmount(amount: number) {
//   return `$${amount.toFixed(2)}`;
// }

// export default function PaymentsPage() {
// const { data, isLoading, isError } = useEarningsSummary();

// const hasSummary = !isLoading && !isError && !!data;


//   return (
//     <div className="min-h-screen bg-background">
//       <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">

//         <PageHeader />

//         <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//           <StatCard
//             title="Available Balance"
//             icon={Wallet}
//             value={isLoading ? "—" : hasSummary ? formatAmount(data.available.totalAmount) : "Unavailable"}
//             description={hasSummary ? `${data.available.count} sessions` : "—"}
//           />

//           <StatCard
//             title="Paid Out"
//             icon={CreditCard}
//             value={isLoading ? "—" : hasSummary ? formatAmount(data.paid_out.totalAmount) : "Unavailable"}
//             description={hasSummary ? `${data.paid_out.count} sessions` : "—"}
//           />

//           <PendingPayoutCard
//             amount={isLoading ? "—" : hasSummary ? formatAmount(data.pending.totalAmount) : "Unavailable"}
//             count={hasSummary ? data.pending.count : 0}
//           />

//         </section>

//         <TransactionsTable />
//       </div>
//     </div>
//   );
// }
"use client";

import { Wallet, CreditCard, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import PageHeader from "@/components/payment/BaymentHeader";
import StatCard from "@/components/payment/StatesCard";
import PendingPayoutCard from "@/components/payment/PendingPayoutCard";
import TransactionsTable from "@/components/payment/FinancialOverview";
import { useEarningsSummary } from "@/hooks/earning/useGetEarningSummery";

function formatAmount(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export default function PaymentsPage() {
  const t = useTranslations("payments.statCards");
  const { data, isLoading, isError } = useEarningsSummary();

  const hasSummary = !isLoading && !isError && !!data;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">

        <PageHeader />

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StatCard
            title={t("availableBalance")}
            icon={Wallet}
            value={isLoading ? "—" : hasSummary ? formatAmount(data.available.totalAmount) : t("unavailable")}
            description={hasSummary ? t("sessionsCount", { count: data.available.count }) : "—"}
          />

          <StatCard
            title={t("paidOut")}
            icon={CreditCard}
            value={isLoading ? "—" : hasSummary ? formatAmount(data.paid_out.totalAmount) : t("unavailable")}
            description={hasSummary ? t("sessionsCount", { count: data.paid_out.count }) : "—"}
          />

          <PendingPayoutCard
            amount={isLoading ? "—" : hasSummary ? formatAmount(data.pending.totalAmount) : t("unavailable")}
            count={hasSummary ? data.pending.count : 0}
          />

        </section>

        <TransactionsTable />
      </div>
    </div>
  );
}