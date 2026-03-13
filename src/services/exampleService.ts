import { getExampleData } from '../repositories/exampleRepository';

/**
 * Example Service
 * Holds the business logic and orchestrates calls to repositories.
 */
export const performExampleOperation = async () => {
  const data = await getExampleData();
  // Perform some logic or transformations...
  return { processed: true, data };
};
