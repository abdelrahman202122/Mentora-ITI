import { UserModel } from './user.model.js';

export const findUserById = async (userId: string) => {
  return UserModel.findById(userId);
};

export const updateUserName = async (userId: string, name: string) => {
  return UserModel.findByIdAndUpdate(
    userId,
    { name },
    {
      new: true,
      runValidators: true,
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
