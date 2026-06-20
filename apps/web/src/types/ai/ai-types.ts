 
export type MessageRole = "user" | "assistant"

export interface Message {
  id: number
  role: MessageRole
  text: string
  options?: string[]
  selectedOption?: string
}

export interface AIResponse {
  message: string
  options?: string[]
  redirectTo?: string
}