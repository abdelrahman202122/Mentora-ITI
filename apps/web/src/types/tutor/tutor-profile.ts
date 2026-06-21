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
  languages: string[];
  education: Education[];
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  experience: Experience[];
}

// export interface TutorProfileResponse {
//   data: TutorProfileData;
// }