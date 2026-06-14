// export interface Conversation {
//   id: number
//   tutorId: number
//   tutorName: string
//   lastMessage: string
//   time: string
//   unread: number
// }

// // جيب كل المحادثات من localStorage
// export async function getConversations(): Promise<Conversation[]> {
//   if (typeof window === "undefined") return []
//   const data = localStorage.getItem("conversations")
//   return data ? JSON.parse(data) : []
// }

// // ضيف محادثة جديدة أو افتح واحدة موجودة
// export async function startConversation(
//   tutorId: number,
//   tutorName: string
// ): Promise<number> {
//   const conversations = await getConversations()

//   // لو المحادثة موجودة بالفعل ارجع الـ id بتاعها
//   const existing = conversations.find((c) => c.tutorId === tutorId)
//   if (existing) return existing.id

//   // لو مش موجودة عمل واحدة جديدة
//   const newConv: Conversation = {
//     id: Date.now(),
//     tutorId,
//     tutorName,
//     lastMessage: "Start a conversation...",
//     time: new Date().toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     }),
//     unread: 0,
//   }

//   const updated = [...conversations, newConv]
//   localStorage.setItem("conversations", JSON.stringify(updated))
//   return newConv.id
// }

// export async function getMessages(chatId: number) {
//   if (typeof window === "undefined") return []
//   const data = localStorage.getItem("messages_" + chatId)
//   return data ? JSON.parse(data) : []
// }

// export async function saveMessage(
//   chatId: number,
//   message: { role: string; text: string; time: string }
// ) {
//   const messages = await getMessages(chatId)
//   const updated = [...messages, { id: Date.now(), ...message }]
//   localStorage.setItem("messages_" + chatId, JSON.stringify(updated))

//   // تحديث آخر رسالة في المحادثة
//   const conversations = await getConversations()
//   const updatedConvs = conversations.map((c) =>
//     c.id === chatId
//       ? { ...c, lastMessage: message.text, time: message.time }
//       : c
//   )
//   localStorage.setItem("conversations", JSON.stringify(updatedConvs))
// }

import api from "@/lib/axios"
import { mockChat, mockMessage, mockUser } from "@/lib/mockData"

export interface Conversation {
  id: string
  tutorId: string
  tutorName: string
  lastMessage: string
  time: string
  unread: number
}

//^------------------------------ start of getConversation function -------------------------
//&This function is responsible for getting the old messages from local storage and if not  available create a new chat
//!when i have a api i will remove the local storage 
export async function getConversations(): Promise<Conversation[]> {

   if (typeof window === "undefined") return []
   //!this condition to protect if i am on server return empty array to avoid crash error 

  const data = localStorage.getItem("conversations")
  if (data) return JSON.parse(data)

  const defaultConv: Conversation[] = [
    {
      id: mockChat._id,
      tutorId: mockChat.participants[1]._id,
      tutorName:
        mockChat.participants[1].firstName +
        " " +
        mockChat.participants[1].lastName,
      lastMessage: mockChat.lastMessage.message,
      time: new Date(mockChat.lastMessage.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      unread: mockChat.unreadCount,
    },
  ]

  localStorage.setItem("conversations", JSON.stringify(defaultConv))
  return defaultConv
}
//^------------------------------ End of getConversation function -------------------------


//^------------------------------ start startConversation function -------------------------
//&This function is responsible for appears the chat between tutors and also between learner 
//& the new chat or old chat based on if the learner contact to the tutor at the first time or not 
export async function startConversation(
  tutorId: string,
  tutorName: string
): Promise<string> {
  

  const conversations = await getConversations()
  const existing = conversations.find((c) => c.tutorId === tutorId)
  if (existing) return existing.id

  const newConv: Conversation = {
    id: "c_" + Date.now(),
    tutorId,
    tutorName,
    lastMessage: "Start a conversation...",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    unread: 0,
  }

  const updated = [...conversations, newConv]
  localStorage.setItem("conversations", JSON.stringify(updated))
  return newConv.id
}
//^------------------------------ end  StartCaonversation function -------------------------
export async function getMessages(chatId: string) {
  // ✅ لما الـ backend يخلص
  // const res = await api.get(`/chats/${chatId}/messages`)
  // return res.data

  if (typeof window === "undefined") return []
  const data = localStorage.getItem("messages_" + chatId)
  if (data) return JSON.parse(data)

  const defaultMessages = [
    {
      id: mockMessage._id,
      role: "tutor",
      text: mockMessage.message,
      time: new Date(mockMessage.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]

  localStorage.setItem(
    "messages_" + chatId,
    JSON.stringify(defaultMessages)
  )
  return defaultMessages
}

export async function saveMessage(
  chatId: string,
  message: { role: string; text: string; time: string }
) {
  // ✅ لما الـ backend يخلص
  // const res = await api.post(`/chats/${chatId}/messages`, { message: message.text })
  // return res.data

  const messages = await getMessages(chatId)
  const updated = [...messages, { id: "m_" + Date.now(), ...message }]
  localStorage.setItem("messages_" + chatId, JSON.stringify(updated))

  const conversations = await getConversations()
  const updatedConvs = conversations.map((c) =>
    c.id === chatId
      ? { ...c, lastMessage: message.text, time: message.time }
      : c
  )
  localStorage.setItem("conversations", JSON.stringify(updatedConvs))
}