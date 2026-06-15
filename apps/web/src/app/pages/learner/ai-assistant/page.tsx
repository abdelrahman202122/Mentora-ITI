"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Send, Mic } from "lucide-react"
import { Message } from "@/types/ai"
import { sendMessageToAI } from "@/lib/api/ai"

export default function AIAssistantPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function getFirstMessage() {
      setLoading(true)
      try {
        const response = await sendMessageToAI("", [])
        setMessages([
          {
            id: 1,
            role: "assistant",
            text: response.message,
            options: response.options,
          },
        ])
      } finally {
        setLoading(false)
      }
    }
    getFirstMessage()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleOption(option: string) {
    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      text: option,
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setLoading(true)

    const history = updatedMessages.map((m) => ({
      role: m.role,
      text: m.text,
    }))

    try {
      const response = await sendMessageToAI(option, history)

      if (response.redirectTo) {
        router.push(response.redirectTo)
        return
      }

      setMessages([
        ...updatedMessages,
        {
          id: updatedMessages.length + 1,
          role: "assistant",
          text: response.message,
          options: response.options,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!input.trim()) return
    await handleOption(input)
    setInput("")
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            AI
          </div>
          <div>
            <p className="font-semibold text-gray-800">Learning Path Assistant</p>
            <p className="text-xs text-gray-400">Personalizing your educational journey</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 mb-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs flex-shrink-0">
                  AI
                </div>
              )}
              <div className={`max-w-sm px-4 py-2 rounded-2xl text-sm ${
                message.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {message.text}
              </div>
            </div>

            {message.options && (
              <div className="flex flex-wrap gap-2 mt-2 ml-10">
                {message.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOption(option)}
                    className="px-3 py-1 rounded-full border border-gray-300 text-sm text-gray-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
              AI
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-2xl text-sm text-gray-400">
              Typing...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border rounded-2xl flex items-center gap-2 px-4 py-3 bg-white">
        <Mic size={18} className="text-gray-400" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your answer here..."
          className="flex-1 text-sm outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 text-white p-2 rounded-xl"
        >
          <Send size={16} />
        </button>
      </div>

      <p className="text-xs text-center text-gray-400 mt-2">
        EduMarket AI may provide inaccurate info about teachers. Verify details before booking.
      </p>

    </div>
  )
}