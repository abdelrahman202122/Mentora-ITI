export interface UploadedUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  isEmailVerified: boolean
}
export interface UpdatedProfile {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  isEmailVerified: boolean
}
