"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { getMessages, saveMessage, type ChatMessage } from "@/services/message/message-service"
import { getLocalePath } from "@/utils/i18n/locale-path"

export default function ChatPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const tutorName = searchParams.get("tutorName") || "Tutor"
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetch() {
      const data = await getMessages(params.id as string)
      setMessages(data)
      setLoading(false)
    }
    fetch()
  }, [params.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!input.trim()) return

    const newMessage = {
      role: "learner" as const,
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    await saveMessage(params.id as string, newMessage)
    setMessages((prev) => [...prev, { id: Date.now(), ...newMessage }])
    setInput("")
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href={getLocalePath(locale, "/messages")}
          className="text-gray-500 hover:text-indigo-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-800">{tutorName}</p>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 bg-white rounded-xl p-4 shadow-sm">
        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "learner" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                msg.role === "learner"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.role === "learner" ? "text-indigo-200" : "text-gray-400"
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-sm">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 text-sm outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 text-white p-2 rounded-xl"
        >
          <Send size={16} />
        </button>
      </div>

    </div>
  )
}
