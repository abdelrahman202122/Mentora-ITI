// "use client";


// interface Transaction {
//   id: number;
//   date: string;
//   student: string;
//   subject: string;
//   duration: string;
//   amount: string;
//   status: "Completed" | "Processing";
// }

// const transactions: Transaction[] = [
//   {
//     id: 1,
//     date: "Oct 24, 2023",
//     student: "Alex Harrison",
//     subject: "Organic Chemistry",
//     duration: "1h",
//     amount: "$85.00",
//     status: "Completed",
//   },
//   {
//     id: 2,
//     date: "Oct 22, 2023",
//     student: "Sarah Lee",
//     subject: "Advanced Calculus",
//     duration: "1.5h",
//     amount: "$120.00",
//     status: "Completed",
//   },
//   {
//     id: 3,
//     date: "Oct 20, 2023",
//     student: "Jordan Miller",
//     subject: "Microbiology",
//     duration: "2h",
//     amount: "$160.00",
//     status: "Processing",
//   },
//   {
//     id: 4,
//     date: "Oct 18, 2023",
//     student: "Emma Knight",
//     subject: "Introduction to Ethics",
//     duration: "1h",
//     amount: "$60.00",
//     status: "Completed",
//   },
// ];

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

// interface Transaction {
//   id: number;
//   date: string;
//   student: string;
//   avatar?: string;
//   subject: string;
//   duration: string;
//   amount: string;
//   status: "Completed" | "Processing";
// }

// export default function TransactionsTable() {
//   return (
//     <section className="rounded-2xl border bg-card shadow-sm overflow-hidden">
//       {/* Header */}
//       <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h2 className="text-lg font-semibold">Recent Transactions</h2>
//           <p className="text-sm text-muted-foreground">
//             Overview of latest payments
//           </p>
//         </div>

//         <Button variant="outline" className="gap-2">
//           <Filter className="h-4 w-4" />
//           Filter
//         </Button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <Table>
//           <TableHeader className="bg-muted/40">
//             <TableRow className="hover:bg-transparent">
//               <TableHead className="p-4">Date</TableHead>
//               <TableHead className="p-4" >Student</TableHead>
//               <TableHead className="p-4">Subject</TableHead>
//               <TableHead className="p-4">Duration</TableHead>
//               <TableHead className="p-4">Amount</TableHead>
//               <TableHead className="text-right p-4">Status</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {transactions.map((item) => (
//               <TableRow
//                 key={item.id}
//                 className="hover:bg-muted/30 transition-colors p-4"
//               >
//                 <TableCell className="text-muted-foreground text-sm p-4">
//                   {item.date}
//                 </TableCell>

//                 {/* Student */}
//                 <TableCell className="p-4">
//                   <div className="flex items-center gap-3">
//                     <img
//                       src={item.avatar}
//                       className="h-8 w-8 rounded-full object-cover ring-2 ring-background"
//                       alt={item.student}
//                     />
//                     <span className="font-medium text-sm">
//                       {item.student}
//                     </span>
//                   </div>
//                 </TableCell>

//                 <TableCell className="text-sm text-muted-foreground p-4">
//                   {item.subject}
//                 </TableCell>

//                 <TableCell className="text-sm p-4">
//                   {item.duration}
//                 </TableCell>

//                 <TableCell className="font-medium p-4">
//                   {item.amount}
//                 </TableCell>

//                 {/* Status */}
//                 <TableCell className="text-right p-4">
//                   <Badge
//                     className={`text-xs px-2 py-1 rounded-full ${
//                       item.status === "Completed"
//                         ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
//                         : "bg-blue-50 text-blue-700 border border-blue-100"
//                     }`}
//                   >
//                     {item.status}
//                   </Badge>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Footer */}
//       <div className="flex items-center justify-between border-t bg-muted/20 px-5 py-4">
//         <p className="text-xs text-muted-foreground">
//           Showing <span className="font-medium">4</span> of 42 transactions
//         </p>

//         <div className="flex gap-1">
//           <Button variant="outline" size="icon" className="h-8 w-8">
//             <ChevronLeft className="h-4 w-4" />
//           </Button>

//           <Button variant="outline" size="icon" className="h-8 w-8">
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>
//     </section>
//   );
// }
"use client";

import { useMyEarnings } from "@/hooks/earning/useMyEarning";
import { useBooking } from "@/hooks/booking/usebookingById";
import { usePublicUserById } from "@/hooks/user/useUserById";
import { useQuery } from "@tanstack/react-query";
import { getTutorSubjectById } from "@/services/tutor/getSubjectById";

import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Earning } from "@/types/earning/earningData";

// ── Row ──────────────────────────────────────────────────────────────────────

function TransactionRow({ earning }: { earning: Earning }) {
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

  const date = new Date(earning.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency", currency: earning.currency ?? "USD",
  }).format(earning.tutorAmount);

  const statusLabel =
    earning.status === "paid_out" ? "Paid Out"
    : earning.status === "available" ? "Available"
    : "Pending";

  const statusClass =
    earning.status === "paid_out"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
      : earning.status === "available"
      ? "bg-blue-50 text-blue-700 border border-blue-100"
      : "bg-amber-50 text-amber-700 border border-amber-100";

  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="text-muted-foreground text-sm p-4">{date}</TableCell>

      <TableCell className="p-4">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-background"
            alt={learner?.name ?? "Student"}
          />
          <span className="font-medium text-sm">
            {learner?.name ?? "—"}
          </span>
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
  const { data, isLoading, isError } = useMyEarnings();

  const earnings = data?.earnings ?? [];
  const pagination = data?.pagination;

  return (
    <section className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <p className="text-sm text-muted-foreground">Overview of latest payments</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="p-4">Date</TableHead>
              <TableHead className="p-4">Student</TableHead>
              <TableHead className="p-4">Subject</TableHead>
              <TableHead className="p-4">Duration</TableHead>
              <TableHead className="p-4">Amount</TableHead>
              <TableHead className="text-right p-4">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground p-8">
                  Loading transactions…
                </TableCell>
              </TableRow>
            )}

            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive p-8">
                  Failed to load transactions.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && earnings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground p-8">
                  No transactions yet.
                </TableCell>
              </TableRow>
            )}

            {earnings.map((earning) => (
              <TransactionRow key={earning._id} earning={earning} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-muted/20 px-5 py-4">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium">{earnings.length}</span>{" "}
          of {pagination?.total ?? 0} transactions
        </p>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}