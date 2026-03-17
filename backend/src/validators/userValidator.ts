import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional(),
    bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
    phone: z.string().max(20, 'Phone must be at most 20 characters').optional(),
  }),
});
