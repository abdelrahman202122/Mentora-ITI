import ReviewSummary from "@/components/TutorReviews/ReviewSummary";
import ReviewCard from "@/components/TutorReviews/ReviewCard";

export default function ReviewsPage() {
        const data = [
  {
    name: "Julian Barnes",
    rating: 5,
    date: "Oct 24, 2024",
    comment: "Great explanation of calculus...",
  },
  {
    name: "Sarah Jenkins",
    rating: 4,
    date: "Oct 22, 2024",
    comment: "Good but needs visuals.",
  },
];

  return (
    
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">My Reviews</h1>
        <p className="text-muted-foreground">
          Monitor student feedback and reputation
        </p>
      </div>

      <ReviewSummary />
    <div className="space-y-4 mt-6">
      {data.map((r, i) => (
        <ReviewCard key={i} {...r} />
      ))}
    </div>
    </div>
  );
}