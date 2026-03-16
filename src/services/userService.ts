import * as userRepository from '../repositories/userRepository';
import { NotFoundError } from '../errors/NotFoundError';

export const getUserProfile = async (userId: string) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Exclude sensitive data
  const { passwordHash, updatedAt, ...safeUser } = user;
  return safeUser;
};

export const updateUserProfile = async (userId: string, data: any) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Only allow safe fields to be updated — never passwordHash, email, etc.
  const { name, avatar, bio, phone } = data;
  const updatedUser = await userRepository.updateUserProfile(userId, { name, avatar, bio, phone });
  return updatedUser;
};
