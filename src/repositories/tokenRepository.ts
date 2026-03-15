import prisma from '../config/prisma';

export const createRefreshToken = async (data: { token: string; userId: string; expiresAt: Date }) => {
  return prisma.refreshToken.create({ data });
};

export const findRefreshTokensByUserId = async (userId: string) => {
  return prisma.refreshToken.findMany({ where: { userId }, include: { user: true } });
};

export const deleteRefreshTokenById = async (id: string) => {
  return prisma.refreshToken.delete({ where: { id } });
};

export const deleteRefreshTokensForUser = async (userId: string) => {
  return prisma.refreshToken.deleteMany({ where: { userId } });
};

