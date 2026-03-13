/**
 * Example Repository
 * Interfaces solely with the database (e.g., PrismaClient).
 */
export const getExampleData = async () => {
  // e.g., prisma.user.findMany()
  return [{ id: 1, name: 'Sample Data' }];
};
