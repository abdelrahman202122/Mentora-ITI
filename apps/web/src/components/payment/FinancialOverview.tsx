
// "use client";

// import { useState } from "react";
// import { useMyEarnings } from "@/hooks/earning/useMyEarning";
// import { useBooking } from "@/hooks/booking/usebookingById";
// import { usePublicUserById } from "@/hooks/user/useUserById";
// import { useQuery } from "@tanstack/react-query";
// import { getTutorSubjectById } from "@/services/tutor/getSubjectById";
// import type { EarningStatus } from "@/services/earning/getMyEarning";

// import {
//   Table, TableBody, TableCell, TableHead,
//   TableHeader, TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { Earning } from "@/types/earning/earningData";

// // ── filter tabs ───────────────────────────────────────────────────────────────

// const STATUS_FILTERS: { label: string; value: EarningStatus | "all" }[] = [
//   { label: "All",       value: "all"       },
//   { label: "Pending",   value: "pending"   },
//   { label: "Available", value: "available" },
//   { label: "Paid Out",  value: "paid_out"  },
//   { label: "Canceled",  value: "canceled"  },
// ];

// // ── Row ───────────────────────────────────────────────────────────────────────

// function TransactionRow({ earning }: { earning: Earning }) {
//   const { data: booking } = useBooking(earning.bookingId);
//   const { data: learner } = usePublicUserById(booking?.learnerId ?? "");

//   const { data: subject } = useQuery({
//     queryKey: ["tutorSubject", earning.tutorId, booking?.subjectId],
//     queryFn: () => getTutorSubjectById(earning.tutorId, booking!.subjectId),
//     enabled: !!booking?.subjectId,
//   });

//   const avatar = learner?.avatar
//     ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${learner.avatar}`
//     : "/profile-default.jpeg";

//   const durationHours = booking
//     ? booking.durationMinutes >= 60
//       ? `${(booking.durationMinutes / 60).toFixed(1).replace(".0", "")}h`
//       : `${booking.durationMinutes}m`
//     : "—";

//   const date = new Date(earning.createdAt).toLocaleDateString("en-US", {
//     month: "short", day: "numeric", year: "numeric",
//   });

//   const amount = new Intl.NumberFormat("en-US", {
//     style: "currency", currency: earning.currency ?? "USD",
//   }).format(earning.tutorAmount);

//   const statusLabel =
//     earning.status === "paid_out"    ? "Paid Out"
//     : earning.status === "available" ? "Available"
//     : earning.status === "canceled"  ? "Canceled"
//     : "Pending";

//   const statusClass =
//     earning.status === "paid_out"
//       ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
//       : earning.status === "available"
//       ? "bg-blue-50 text-blue-700 border border-blue-100"
//       : earning.status === "canceled"
//       ? "bg-red-50 text-red-700 border border-red-100"
//       : "bg-amber-50 text-amber-700 border border-amber-100";

//   return (
//     <TableRow className="hover:bg-muted/30 transition-colors">
//       <TableCell className="text-muted-foreground text-sm p-4">{date}</TableCell>

//       <TableCell className="p-4">
//         <div className="flex items-center gap-3">
//           <img
//             src={avatar}
//             className="h-8 w-8 rounded-full object-cover ring-2 ring-background"
//             alt={learner?.name ?? "Student"}
//           />
//           <span className="font-medium text-sm">{learner?.name ?? "—"}</span>
//         </div>
//       </TableCell>

//       <TableCell className="text-sm text-muted-foreground p-4">
//         {subject?.title ?? "—"}
//       </TableCell>

//       <TableCell className="text-sm p-4">{durationHours}</TableCell>
//       <TableCell className="font-medium p-4">{amount}</TableCell>

//       <TableCell className="text-right p-4">
//         <Badge className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
//           {statusLabel}
//         </Badge>
//       </TableCell>
//     </TableRow>
//   );
// }

// // ── Table ─────────────────────────────────────────────────────────────────────

// export default function TransactionsTable() {
//   const [activeFilter, setActiveFilter] = useState<EarningStatus | "all">("all");
//   const [currentPage, setCurrentPage]   = useState(1);

//   function handleFilterChange(value: EarningStatus | "all") {
//     setActiveFilter(value);
//     setCurrentPage(1);
//   }

//   const { data, isLoading, isError } = useMyEarnings(
//     activeFilter !== "all"
//       ? { status: activeFilter, page: currentPage, limit: 10 }
//       : { page: currentPage, limit: 10 }
//   );

//   const earnings   = data?.earnings   ?? [];
//   const pagination = data?.pagination;
//   const totalPages = Math.max(pagination?.totalPages ?? 1, 1);

//   return (
//     <section className="rounded-2xl border bg-card shadow-sm overflow-hidden">

//       {/* Header */}
//       <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h2 className="text-lg font-semibold">Recent Transactions</h2>
//           <p className="text-sm text-muted-foreground">Overview of latest payments</p>
//         </div>

//         {/* Filter tabs */}
//         <div className="flex flex-wrap gap-2">
//           {STATUS_FILTERS.map(({ label, value }) => (
//             <button
//               key={value}
//               onClick={() => handleFilterChange(value)}
//               className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
//                 activeFilter === value
//                   ? "bg-primary text-primary-foreground border-primary"
//                   : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
//               }`}
//             >
//               {label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <Table>
//           <TableHeader className="bg-muted/40">
//             <TableRow className="hover:bg-transparent">
//               <TableHead className="p-4">Date</TableHead>
//               <TableHead className="p-4">Student</TableHead>
//               <TableHead className="p-4">Subject</TableHead>
//               <TableHead className="p-4">Duration</TableHead>
//               <TableHead className="p-4">Amount</TableHead>
//               <TableHead className="text-right p-4">Status</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {isLoading && (
//               <TableRow>
//                 <TableCell colSpan={6} className="text-center text-muted-foreground p-8">
//                   Loading transactions…
//                 </TableCell>
//               </TableRow>
//             )}

//             {isError && (
//               <TableRow>
//                 <TableCell colSpan={6} className="text-center text-destructive p-8">
//                   Failed to load transactions.
//                 </TableCell>
//               </TableRow>
//             )}

//             {!isLoading && !isError && earnings.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={6} className="text-center text-muted-foreground p-8">
//                   No transactions yet.
//                 </TableCell>
//               </TableRow>
//             )}

//             {!isLoading && !isError && earnings.map((earning) => (
//               <TransactionRow key={earning._id} earning={earning} />
//             ))}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Footer */}
//       <div className="flex items-center justify-between border-t bg-muted/20 px-5 py-4">
//         <p className="text-xs text-muted-foreground">
//           Showing <span className="font-medium">{earnings.length}</span>{" "}
//           of {pagination?.total ?? 0} transactions
//         </p>

//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             size="icon"
//             className="h-8 w-8"
//             onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//             disabled={currentPage === 1}
//           >
//             <ChevronLeft className="h-4 w-4" />
//           </Button>

//           <span className="text-xs text-muted-foreground">
//             {currentPage} / {totalPages}
//           </span>

//           <Button
//             variant="outline"
//             size="icon"
//             className="h-8 w-8"
//             onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//             disabled={currentPage === totalPages}
//           >
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//     </section>
//   );
// }
"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useMyEarnings } from "@/hooks/earning/useMyEarning";
import { useBooking } from "@/hooks/booking/usebookingById";
import { usePublicUserById } from "@/hooks/user/useUserById";
import { useQuery } from "@tanstack/react-query";
import { getTutorSubjectById } from "@/services/tutor/getSubjectById";
import type { EarningStatus } from "@/services/earning/getMyEarning";

import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Earning } from "@/types/earning/earningData";

// ── Row ───────────────────────────────────────────────────────────────────────

function TransactionRow({ earning }: { earning: Earning }) {
  const t = useTranslations("payments.transactionsTable");
  const tStatus = useTranslations("earningStatus");
  const locale = useLocale();

  const { data: booking } = useBooking(earning.bookingId);
  const { data: learner } = usePublicUserById(booking?.learnerId ?? "");

  const { data: subject } = useQuery({
    queryKey: ["tutorSubject", earning.tutorId, booking?.subjectId],
    queryFn: () => getTutorSubjectById(earning.tutorId, booking!.subjectId),
    enabled: !!booking?.subjectId,
  });

  const avatar = learner?.avatar
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${learner.avatar}`
    : "/profile-default.jpeg";

  const durationHours = booking
    ? booking.durationMinutes >= 60
      ? `${(booking.durationMinutes / 60).toFixed(1).replace(".0", "")}h`
      : `${booking.durationMinutes}m`
    : "—";

  const formattedLocale = locale === "ar" ? "ar-EG" : "en-US";

  const date = new Date(earning.createdAt).toLocaleDateString(formattedLocale, {
    month: "short", day: "numeric", year: "numeric",
  });

  const amount = new Intl.NumberFormat(formattedLocale, {
    style: "currency", currency: "EGP",
  }).format(earning.tutorAmount);

  const statusLabel = tStatus(earning.status ?? "pending");

  const statusClass =
    earning.status === "paid_out"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
      : earning.status === "available"
      ? "bg-blue-50 text-blue-700 border border-blue-100"
      : earning.status === "canceled"
      ? "bg-red-50 text-red-700 border border-red-100"
      : "bg-amber-50 text-amber-700 border border-amber-100";

  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="text-muted-foreground text-sm p-4">{date}</TableCell>

      <TableCell className="p-4">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-background"
            alt={learner?.name ?? t("defaultStudent")}
          />
          <span className="font-medium text-sm">{learner?.name ?? "—"}</span>
        </div>
      </TableCell>

      <TableCell className="text-sm text-muted-foreground p-4">
        {subject?.title ?? "—"}
      </TableCell>

      <TableCell className="text-sm p-4">{durationHours}</TableCell>
      <TableCell className="font-medium p-4">{amount}</TableCell>

      <TableCell className="text-right p-4">
        <Badge className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
          {statusLabel}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

export default function TransactionsTable() {
  const t = useTranslations("payments.transactionsTable");
  const tStatus = useTranslations("earningStatus");

  const [activeFilter, setActiveFilter] = useState<EarningStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const STATUS_FILTERS: { label: string; value: EarningStatus | "all" }[] = [
    { label: tStatus("all"),       value: "all"       },
    { label: tStatus("pending"),   value: "pending"   },
    { label: tStatus("available"), value: "available" },
    { label: tStatus("paid_out"),  value: "paid_out"  },
    { label: tStatus("canceled"),  value: "canceled"  },
  ];

  function handleFilterChange(value: EarningStatus | "all") {
    setActiveFilter(value);
    setCurrentPage(1);
  }

  const { data, isLoading, isError } = useMyEarnings(
    activeFilter !== "all"
      ? { status: activeFilter, page: currentPage, limit: 10 }
      : { page: currentPage, limit: 10 }
  );

  const earnings   = data?.earnings   ?? [];
  const pagination = data?.pagination;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);

  return (
    <section className="rounded-2xl border bg-card shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeFilter === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="p-4">{t("columns.date")}</TableHead>
              <TableHead className="p-4">{t("columns.student")}</TableHead>
              <TableHead className="p-4">{t("columns.subject")}</TableHead>
              <TableHead className="p-4">{t("columns.duration")}</TableHead>
              <TableHead className="p-4">{t("columns.amount")}</TableHead>
              <TableHead className="text-right p-4">{t("columns.status")}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground p-8">
                  {t("loading")}
                </TableCell>
              </TableRow>
            )}

            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive p-8">
                  {t("error")}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && earnings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground p-8">
                  {t("empty")}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && earnings.map((earning) => (
              <TransactionRow key={earning._id} earning={earning} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-muted/20 px-5 py-4">
        <p className="text-xs text-muted-foreground">
          {t("showing", { count: earnings.length, total: pagination?.total ?? 0 })}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-xs text-muted-foreground">
            {currentPage} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </section>
  );
}
