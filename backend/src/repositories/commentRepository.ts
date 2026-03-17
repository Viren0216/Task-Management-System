import prisma from '../config/prisma';

const commentInclude = {
  user: {
    select: { id: true, name: true, email: true, avatar: true },
  },
};

export const createComment = async (data: { content: string; taskId: string; userId: string }) => {
  return prisma.comment.create({
    data,
    include: commentInclude,
  });
};

export const findTaskComments = async (taskId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { taskId },
      include: commentInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.comment.count({ where: { taskId } }),
  ]);

  return { comments, total, page, limit };
};

export const findCommentById = async (commentId: string) => {
  return prisma.comment.findUnique({
    where: { id: commentId },
    include: commentInclude,
  });
};

export const updateComment = async (commentId: string, content: string) => {
  return prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: commentInclude,
  });
};

export const deleteComment = async (commentId: string) => {
  return prisma.comment.delete({
    where: { id: commentId },
  });
};
