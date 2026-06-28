export * from "./admin";





export interface StatCard {
  title: string
  value: string | number
  icon?: string
  change?: string
}  

export interface HealthMetric {
  label: string
  value: string
  status: 'operational' | 'degraded' | 'down'
}


export interface FinancialData {
  day: string
  value: number
}

export type Role = "Tutor" | "Student" | "Admin";
export type Status = "Active" | "Pending" | "Suspended";


export interface UserReview {
  reviewer: string;
  relativeTime: string;
  rating: number;
  text: string;
}
