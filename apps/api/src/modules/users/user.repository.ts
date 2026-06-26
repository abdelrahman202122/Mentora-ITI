import type { ClientSession } from 'mongoose';
import { UserModel } from './user.model.js';

export const findUserById = async (userId: string) => {
  return UserModel.findById(userId);
};

export const updateUserRole = async (
  userId: string,
  role: string,
  // profileId: string,
  session?: ClientSession,
) => {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      role,
      // tutorProfile: profileId,
    },
    {
      new: true,
      runValidators: true,
      session,
    },
  );
};

export const updateUserName = async (
  userId: string,
  name: string,
  session?: ClientSession,
) => {
  return UserModel.findByIdAndUpdate(
    userId,
    { name },
    {
      new: true,
      runValidators: true,
      session,
    },
  );
};

export const updateUserAvatar = async (userId: string, avatarUrl: string) => {
  return UserModel.findByIdAndUpdate(
    userId,
    { avatar: avatarUrl },
    {
      new: true,
      runValidators: true,
    },
  );
};

export const clearUserAvatar = async (userId: string) => {
  return UserModel.findByIdAndUpdate(
    userId,
    { $unset: { avatar: '' } },
    {
      new: true,
      runValidators: true,
    },
  );
};
