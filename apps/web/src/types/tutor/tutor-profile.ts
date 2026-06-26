export interface Education {
  degree: string;
  field: string;
  institution: string;
  graduationYear: number;
}

export interface Experience {
  title: string;
  startYear: number;
  startMonth: number;
  endYear: number | null;
  endMonth: number | null;
  isCurrent: boolean;
}
export interface UserData {
  _id: string;
  name: string;
  avatar: string;
}
export interface TutorProfileData {
   _id: string;
  userId: string;
  headline: string;
  bio: string;
  hourlyRate: number;
  languages: string[];
  experience: Experience[];
  education: Education[];
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  userData: UserData;
}

