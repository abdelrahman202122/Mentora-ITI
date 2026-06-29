import { NotFoundError } from '../../common/errors/AppError.js';
import type {
  ListChatsQuery,
  ListMessagesQuery,
} from '../../validators/chat.js';
import type { ChatStatus } from './chat.model.js';
import * as chatRepository from './chat.repository.js';

type Identifier = { toString(): string };

type Participant = {
  _id: Identifier;
  name: string;
  role: string;
  avatar?: string;
};

type PopulatedChat = {
  _id: Identifier;
  learnerId: Participant;
  tutorId: Participant;
  status: ChatStatus;
  lastMessage?: {
    messageId?: Identifier;
    senderId?: Identifier;
    preview?: string;
    sentAt?: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

function formatParticipant(participant: Participant) {
  return {
    id: participant._id.toString(),
    name: participant.name,
    role: participant.role,
    avatar: participant.avatar,
  };
}

function formatChat(chat: PopulatedChat, viewerId: string) {
  const learnerId = chat.learnerId._id.toString();
  const otherParticipant =
    learnerId === viewerId ? chat.tutorId : chat.learnerId;

  return {
    id: chat._id.toString(),
    status: chat.status,
    participant: formatParticipant(otherParticipant),
    lastMessage: chat.lastMessage?.messageId
      ? {
          id: chat.lastMessage.messageId.toString(),
          senderId: chat.lastMessage.senderId?.toString(),
          preview: chat.lastMessage.preview,
          sentAt: chat.lastMessage.sentAt,
        }
      : null,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
}

async function getPopulatedChat(chatId: string, viewerId: string) {
  const chat = await chatRepository.findPopulatedParticipantChat(
    chatId,
    viewerId,
  );

  if (!chat) {
    throw new NotFoundError('Chat not found');
  }

  return formatChat(chat as unknown as PopulatedChat, viewerId);
}

export async function getChat(chatId: string, userId: string) {
  return getPopulatedChat(chatId, userId);
}

export async function createOrGetChat(learnerId: string, tutorId: string) {
  const tutor = await chatRepository.findActiveTutor(tutorId);

  if (!tutor) {
    throw new NotFoundError('Tutor not found');
  }

  const chat = await chatRepository.findOrCreateChat(learnerId, tutorId);
  return getPopulatedChat(chat._id.toString(), learnerId);
}

export async function listChats(userId: string, query: ListChatsQuery) {
  const skip = (query.page - 1) * query.limit;
  const [chats, total] = await Promise.all([
    chatRepository.findChatsForUser(userId, query.status, skip, query.limit),
    chatRepository.countChatsForUser(userId, query.status),
  ]);

  return {
    chats: (chats as unknown as PopulatedChat[]).map((chat) =>
      formatChat(chat, userId),
    ),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function listMessages(
  chatId: string,
  userId: string,
  query: ListMessagesQuery,
) {
  const chat = await chatRepository.findParticipantChat(chatId, userId);

  if (!chat) {
    throw new NotFoundError('Chat not found');
  }

  const skip = (query.page - 1) * query.limit;
  const [messages, total] = await Promise.all([
    chatRepository.findMessages(chatId, skip, query.limit),
    chatRepository.countMessages(chatId),
  ]);

  return {
    messages: messages.reverse().map((message) => ({
      id: message._id.toString(),
      chatId: message.chatId.toString(),
      senderId: message.senderId.toString(),
      recipientId: message.recipientId.toString(),
      type: message.type,
      content: message.content,
      status: message.status,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function archiveChat(chatId: string, userId: string) {
  const chat = await chatRepository.archiveParticipantChat(chatId, userId);

  if (!chat) {
    throw new NotFoundError('Chat not found');
  }

  return getPopulatedChat(chat._id.toString(), userId);
}

export async function restoreChat(chatId: string, userId: string) {
  const chat = await chatRepository.restoreParticipantChat(chatId, userId);

  if (!chat) {
    throw new NotFoundError('Chat not found');
  }

  return getPopulatedChat(chat._id.toString(), userId);
}
