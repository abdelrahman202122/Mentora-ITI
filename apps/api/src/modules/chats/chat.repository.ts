import mongoose from 'mongoose';

import { MessageModel } from '../messages/message.model.js';
import { UserModel } from '../users/user.model.js';
import { ChatModel, type ChatStatus } from './chat.model.js';

const { Types } = mongoose;

export function findActiveTutor(tutorId: string) {
  return UserModel.findOne({
    _id: new Types.ObjectId(tutorId),
    role: 'tutor',
    isActive: true,
  })
    .select('_id')
    .lean()
    .exec();
}

export function findOrCreateChat(learnerId: string, tutorId: string) {
  return ChatModel.findOneAndUpdate(
    {
      learnerId: new Types.ObjectId(learnerId),
      tutorId: new Types.ObjectId(tutorId),
    },
    {
      $set: { status: 'active' },
      $setOnInsert: {
        learnerId: new Types.ObjectId(learnerId),
        tutorId: new Types.ObjectId(tutorId),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).exec();
}

function populatedChatQuery() {
  return ChatModel.find()
    .populate('learnerId', 'name role avatar')
    .populate('tutorId', 'name role avatar');
}

export function findPopulatedParticipantChat(chatId: string, userId: string) {
  return populatedChatQuery()
    .findOne({
      _id: new Types.ObjectId(chatId),
      $or: [
        { learnerId: new Types.ObjectId(userId) },
        { tutorId: new Types.ObjectId(userId) },
      ],
    })
    .lean()
    .exec();
}

export function findChatsForUser(
  userId: string,
  status: ChatStatus,
  skip: number,
  limit: number,
) {
  const participantFilter = {
    $or: [
      { learnerId: new Types.ObjectId(userId) },
      { tutorId: new Types.ObjectId(userId) },
    ],
    status,
  };

  return populatedChatQuery()
    .find(participantFilter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
}

export function countChatsForUser(userId: string, status: ChatStatus) {
  return ChatModel.countDocuments({
    $or: [
      { learnerId: new Types.ObjectId(userId) },
      { tutorId: new Types.ObjectId(userId) },
    ],
    status,
  }).exec();
}

export function findParticipantChat(chatId: string, userId: string) {
  return ChatModel.findOne({
    _id: new Types.ObjectId(chatId),
    $or: [
      { learnerId: new Types.ObjectId(userId) },
      { tutorId: new Types.ObjectId(userId) },
    ],
  })
    .lean()
    .exec();
}

export function findMessages(chatId: string, skip: number, limit: number) {
  return MessageModel.find({
    chatId: new Types.ObjectId(chatId),
    deletedAt: null,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
}

export function countMessages(chatId: string) {
  return MessageModel.countDocuments({
    chatId: new Types.ObjectId(chatId),
    deletedAt: null,
  }).exec();
}

export function archiveParticipantChat(chatId: string, userId: string) {
  return ChatModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(chatId),
      $or: [
        { learnerId: new Types.ObjectId(userId) },
        { tutorId: new Types.ObjectId(userId) },
      ],
    },
    { $set: { status: 'archived' } },
    { new: true },
  ).exec();
}
