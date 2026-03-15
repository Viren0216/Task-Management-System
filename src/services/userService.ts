import * as userRepository from '../repositories/userRepository';
import { NotFoundError } from '../errors/NotFoundError';

export const getUserProfile = async (userId: string) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Exclude sensitive data
  const { passwordHash, role, updatedAt, ...safeUser } = user;
  return safeUser;
};

export const updateUserProfile = async (userId: string, data: any) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updatedUser = await userRepository.updateUserProfile(userId, data);
  return updatedUser;
};
