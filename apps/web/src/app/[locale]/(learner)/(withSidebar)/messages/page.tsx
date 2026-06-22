"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { MessageSquare } from "lucide-react"
import { getConversations, type Conversation } from "@/services/message/message-service"
import { getLocalePath } from "@/utils/i18n/locale-path"

export default function MessagesPage() {
  const locale = useLocale()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const data = await getConversations()
      setConversations(data)
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) {
    return <p className="text-gray-400">Loading...</p>
  }

  return (
    <div className="max-w-2xl mx-auto">

      <h1 className="text-xl font-bold text-gray-800 mb-6">Messages</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {conversations.length === 0 ? (
          <p className="text-gray-400 text-center p-6">No conversations yet.</p>
        ) : (
          conversations.map((conv, index) => (
            <Link
              key={conv.id}
              href={getLocalePath(locale, "/messages/" + conv.id)}
              className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                index !== conversations.length - 1 ? "border-b" : ""
              }`}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={20} className="text-indigo-600" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  {conv.tutorName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {conv.lastMessage}
                </p>
              </div>

              {/* Time + Unread */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-xs text-gray-400">{conv.time}</p>
                {conv.unread > 0 && (
                  <span className="bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

    </div>
  )
}
