// "use client";

// import { Clock } from "lucide-react";

// interface PendingPayoutCardProps {
//   amount: string;
//   availableDate: string;
// }

// export default function PendingPayoutCard({
//   amount,
//   availableDate,
// }: PendingPayoutCardProps) {
//   return (
//     <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
//       {/* Glow */}
//       <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

//       <div className="relative z-10">
//         <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
//           <Clock className="h-6 w-6" />
//         </div>

//         <p className="text-sm text-primary-foreground/80">
//           Pending Payout
//         </p>

//         <h2 className="mt-2 text-3xl font-bold">
//           {amount}
//         </h2>

//         <p className="mt-4 text-sm text-primary-foreground/80">
//           Available {availableDate}
//         </p>
//       </div>
//     </div>
//   );
// }
// 
"use client";

import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface PendingPayoutCardProps {
  amount: string;
  count: number;
}

export default function PendingPayoutCard({ amount, count }: PendingPayoutCardProps) {
  const t = useTranslations("payments.pendingPayout");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg">
      <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
          <Clock className="h-6 w-6" />
        </div>

        <p className="text-sm text-primary-foreground/80">{t("title")}</p>

        <h2 className="mt-2 text-3xl font-bold">{amount}</h2>

        <p className="mt-4 text-sm text-primary-foreground/80">
          {t(count === 1 ? "session" : "sessions", { count })}
        </p>
      </div>
    </div>
  );
}
