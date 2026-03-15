import prisma from '../config/prisma';

export const createRefreshToken = async (data: { token: string; userId: string; expiresAt: Date }) => {
  return prisma.refreshToken.create({ data });
};

export const findRefreshToken = async (token: string) => {
  return prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });
};

export const deleteRefreshToken = async (token: string) => {
  return prisma.refreshToken.delete({ where: { token } });
};

export const deleteRefreshTokensForUser = async (userId: string) => {
  return prisma.refreshToken.deleteMany({ where: { userId } });
};
