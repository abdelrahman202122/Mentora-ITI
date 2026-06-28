import { io, type Socket } from 'socket.io-client';

import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/types/chat/chat-types';

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let chatSocket: ChatSocket | null = null;

function getSocketOrigin() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
  }

  try {
    const url = new URL(apiBaseUrl);
    const basePath = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');

    return {
      origin: url.origin,
      path: `${basePath}/socket.io`,
    };
  } catch {
    throw new Error('NEXT_PUBLIC_API_BASE_URL must be a valid absolute URL');
  }
}

export function getChatSocket(): ChatSocket {
  if (typeof window === 'undefined') {
    throw new Error('The chat socket is only available in the browser');
  }

  if (!chatSocket) {
    const { origin, path } = getSocketOrigin();

    chatSocket = io(origin, {
      autoConnect: false,
      path,
      withCredentials: true,
    });
  }

  return chatSocket;
}

export function disconnectChatSocket() {
  chatSocket?.disconnect();
  chatSocket = null;
}
