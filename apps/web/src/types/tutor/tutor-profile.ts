export interface Education {
  degree: string;
  field: string;
  institution: string;
  graduationYear: number | null;
}

export interface Experience {
  title: string;
  startYear: number;
  startMonth: number;
  endYear: number | null;
  endMonth: number | null;
  isCurrent: boolean;
}

export interface TutorProfileData {
  _id: string;
  userId: string;
  headline: string;
  bio: string;
  hourlyRate: number;
  languages: string[];
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  experience: Experience[];
  education: Education[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// export interface TutorProfileResponse {
//   data: TutorProfileData;
// }