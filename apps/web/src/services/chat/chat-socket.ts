import { io, type Socket } from "socket.io-client";

import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types/chat/chat-types";

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let chatSocket: ChatSocket | null = null;

function getSocketOrigin() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be a valid absolute URL");
  }
}

export function getChatSocket(): ChatSocket {
  if (typeof window === "undefined") {
    throw new Error("The chat socket is only available in the browser");
  }

  if (!chatSocket) {
    chatSocket = io(getSocketOrigin(), {
      autoConnect: false,
      withCredentials: true,
    });
  }

  return chatSocket;
}

export function disconnectChatSocket() {
  chatSocket?.disconnect();
  chatSocket = null;
}
