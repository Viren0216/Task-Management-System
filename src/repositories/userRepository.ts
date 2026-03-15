import prisma from '../config/prisma';

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

export const createUser = async (data: any) => {
  return prisma.user.create({ data });
};

export const updatePassword = async (id: string, passwordHash: string) => {
  return prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
};
