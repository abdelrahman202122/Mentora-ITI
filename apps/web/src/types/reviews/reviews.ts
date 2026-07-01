export interface Review {
  _id: string;
  bookingId: string;
  learnerId: string;
  tutorId: string;
  tutorProfileId: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface ReviewPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface ReviewsData {
  reviews: Review[];
  pagination: ReviewPagination;
}