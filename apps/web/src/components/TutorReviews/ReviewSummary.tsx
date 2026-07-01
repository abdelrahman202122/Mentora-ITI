// import { StarHalf, Star , StarHalfIcon , LucideStarHalf } from "lucide-react";

// export default function ReviewSummary({ reviews } : {
//   reviews: number;
// }) {
//   return (
//     <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
//       {/* Average */}
//       <div className="md:col-span-4 border border-border bg-card p-6 rounded-xl text-center">
//         <p className="text-xs text-muted-foreground">Average Rating</p>

//         <div className="text-5xl font-bold text-primary mt-2">
//           4.9 <span className="text-xl">/5</span>
//         </div>
//         <div className="flex justify-center items-center p-2">
//         <div className="flex items-center gap-1 mb-3">
//         {Array.from({ length: 4 }).map((_, index) => (
//           <Star
//             key={index}
//             size={18}
//             className={ "fill-yellow-400 text-yellow-400"
//             }
//           />
//         ))}
//           <StarHalfIcon
//             key={"123"}
//             size={18}
//             className={ "fill-yellow-400"}
          
//           />
//       </div>

//         </div>

//         <p className="text-sm text-muted-foreground mt-2">
//           Based on {reviews} reviews
//         </p>
//       </div>

//       {/* Breakdown */}
//       <div className="md:col-span-8 border border-border bg-card p-6 rounded-xl">
//         <h3 className="font-semibold mb-4">Rating Breakdown</h3>

//         {[
//           { label: "5", value: 85 },
//           { label: "4", value: 10 },
//           { label: "3", value: 3 },
//           { label: "2", value: 1 },
//           { label: "1", value: 1 },
//         ].map((item) => (
//           <div key={item.label} className="flex items-center gap-3 mb-2">
//             <span className="w-10 text-sm">{item.label}★</span>

//             <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-primary"
//                 style={{ width: `${item.value}%` }}
//               />
//             </div>

//             <span className="text-xs text-muted-foreground w-10">
//               {item.value}%
//             </span>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

import { StarRating } from "@/components/reviews/StarRating";

export default function ReviewSummary({
  rating,
  totalReviews,
}: {
  rating: number;
  totalReviews: number;
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-12   gap-6">
      {/* Average */}
      <div className="md:col-span-6   border border-border bg-card p-6 rounded-xl text-center">
        <p className="text-lg text-muted-foreground">Average Rating</p>

        <div className="text-5xl font-bold text-primary mt-2">
          {rating.toFixed(1)} <span className="text-xl">/5</span>
        </div>

        <div className="flex justify-center p-2">
          <StarRating rating={rating} size={24} className="mb-3" />
        </div>

        <p className="text-lg text-muted-foreground mt-2">
          Based on {totalReviews} reviews
        </p>
      </div>

      {/* Breakdown — TODO: backend endpoint not built yet, keeping static for now */}
      {/* <div className="md:col-span-8 border border-border bg-card p-6 rounded-xl">
        <h3 className="font-semibold mb-4">Rating Breakdown</h3>

        {[
          { label: "5", value: 85 },
          { label: "4", value: 10 },
          { label: "3", value: 3 },
          { label: "2", value: 1 },
          { label: "1", value: 1 },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 mb-2">
            <span className="w-10 text-sm">{item.label}★</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${item.value}%` }} />
            </div>
            <span className="text-xs text-muted-foreground w-10">{item.value}%</span>
          </div>
        ))}
      </div> */}
    </section>
  );
}
