// import api from "@/lib/axios"
// import { AIResponse } from '@/types/ai';

// export async function sendMessageToAI( message: string,history: { role: string; text: string }[],): Promise<AIResponse> 
// {
//   // ✅ لما الـ backend يخلص — شيل الـ comment
//   // const res = await api.post("/ai/chat", { message, history })
//   // return res.data

//   // 🔄 Static responses مؤقتة
//   await new Promise((resolve) => setTimeout(resolve, 1000));

//   if (!history.length) {
//     return {
//       message:
//         "Hi there! I'm your EduMarket guide. What do you want to learn today?",
//       options: ['Mathematics', 'Graphic Design', 'Data Science', 'Piano'],
//     };
//   }
//   if (history.length === 2) {
//     return {
//       message: 'Great choice! What is your current level?',
//       options: ['Beginner', 'Intermediate', 'Advanced'],
//     };
//   }
//   if (history.length === 4) {
//     return {
//       message: 'Got it. And finally, what is your budget per session?',
//       options: ['$15 - $30', '$30 - $50', '$50 - $100'],
//     };
//   }
//   return {
//     message: 'Perfect! Let me find the best tutors for you.',
//     redirectTo: '/learner-dashboard/tutor-match',
//   };
// }
// export interface Tutor {
//   id: number
//   name: string
//   title: string
//   subjects: string[]
//   rating: number
//   bio: string
//   hourlyRate: number
//   availability: string[]
//   totalReviews: number
//   totalStudents: number
// }

// export interface Review {
//   id: number
//   learnerName: string
//   rating: number
//   comment: string
//   date: string
// }

// import api from "@/lib/axios"
// import { mockAiRecommendation } from "@/lib/mockData"
// import { AIResponse } from "@/types/ai"

// export async function sendMessageToAI(
//   message: string,
//   history: { role: string; text: string }[]
// ): Promise<AIResponse> {
//   // ✅ لما الـ backend يخلص
//   // const res = await api.post("/ai/chat", { message, history })
//   // return res.data

//   await new Promise((resolve) => setTimeout(resolve, 1000))

//   if (!history.length) {
//     return {
//       message: "Hi there! I'm your EduMarket guide. What do you want to learn today?",
//       options: ["Mathematics", "Graphic Design", "Data Science", "Piano"],
//     }
//   }
//   if (history.length === 2) {
//     return {
//       message: "Great choice! What is your current level?",
//       options: ["Beginner", "Intermediate", "Advanced"],
//     }
//   }
//   if (history.length === 4) {
//     return {
//       message: "Got it. And finally, what is your budget per session?",
//       options: ["$15 - $30", "$30 - $50", "$50 - $100"],
//     }
//   }
//   return {
//     message:
//       mockAiRecommendation.reason +
//       " Score: " +
//       mockAiRecommendation.score +
//       "%",
//     redirectTo: "/learner-dashboard/tutor-match",
//   }
// }

import { mockAiRecommendation } from "@/lib/mockData"
import { AIResponse } from "@/types/ai"

type Step = "subject" | "level" | "budget" | "done"

function getCurrentStep(history: { role: string; text: string }[]): Step {
  const userMessages = history.filter((m) => m.role === "user")

  if (userMessages.length === 0) return "subject"
  if (userMessages.length === 1) return "level"
  if (userMessages.length === 2) return "budget"
  return "done"
}

function extractSubject(text: string): string {
  const subjects = ["mathematics", "math", "graphic design", "data science", "piano"]
  const lower = text.toLowerCase()
  return subjects.find((s) => lower.includes(s)) || text
}

function extractLevel(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes("beginner")) return "Beginner"
  if (lower.includes("intermediate")) return "Intermediate"
  if (lower.includes("advanced")) return "Advanced"
  return text
}

function extractBudget(text: string): string {
  if (text.includes("15") || text.includes("30")) return "$15 - $30"
  if (text.includes("50")) return "$30 - $50"
  if (text.includes("100")) return "$50 - $100"
  return text
}

export async function sendMessageToAI(
  message: string,
  history: { role: string; text: string }[]
): Promise<AIResponse> {
  // ✅ لما الـ backend يخلص
  // const res = await api.post("/ai/chat", { message, history })
  // return res.data

  await new Promise((resolve) => setTimeout(resolve, 800))

  const step = getCurrentStep(history)
  const userMessages = history.filter((m) => m.role === "user")

  switch (step) {
    case "subject":
      return {
        message: "Hi there! I'm your Mentora guide. What do you want to learn today?",
        options: ["Mathematics", "Graphic Design", "Data Science", "Piano"],
      }

    case "level": {
      const subject = extractSubject(userMessages[0]?.text || "")
      return {
        message: `Great choice! What is your current level in ${subject}?`,
        options: ["Beginner", "Intermediate", "Advanced"],
      }
    }

    case "budget": {
      const level = extractLevel(userMessages[1]?.text || "")
      return {
        message: `Got it — ${level} level. What is your budget per session?`,
        options: ["$15 - $30", "$30 - $50", "$50 - $100"],
      }
    }

    case "done": {
      const subject = extractSubject(userMessages[0]?.text || "")
      const level = extractLevel(userMessages[1]?.text || "")
      const budget = extractBudget(userMessages[2]?.text || "")

      return {
        message:
          `Perfect! I found tutors who teach ${subject} ` +
          `at ${level} level within ${budget} budget. ` +
          `Match score: ${mockAiRecommendation.score}% — ` +
          `${mockAiRecommendation.reason}`,
        redirectTo: "/pages/learner/tutor-match",
      }
    }
  }
}