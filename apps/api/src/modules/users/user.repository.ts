import type { ClientSession } from 'mongoose';
import { UserModel } from './user.model.js';
import { UserRole } from './user.interface.js';
import { getPrimaryRole, normalizeRoles } from './role.utils.js';

export const findUserById = async (userId: string) => {
  return UserModel.findById(userId);
};

export const updateUserRole = async (
  userId: string,
  role: string,
  // profileId: string,
  session?: ClientSession,
) => {
  const roles = normalizeRoles({ role });

  return UserModel.findByIdAndUpdate(
    userId,
    {
      role: getPrimaryRole(roles),
      roles,
      // tutorProfile: profileId,
    },
    {
      new: true,
      runValidators: true,
      session,
    },
);
};

export const addUserRole = async (
  userId: string,
  role: UserRole,
  session?: ClientSession,
) => {
  const user = await UserModel.findById(userId).session(session ?? null);
  if (!user) {
    return null;
  }

  const roles = normalizeRoles(user);
  if (!roles.includes(role)) {
    roles.push(role);
  }

  user.roles = roles;
  user.role = getPrimaryRole(roles);

  return user.save({ session });
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
