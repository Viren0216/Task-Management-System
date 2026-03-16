import { z } from 'zod';
import { ProjectRole } from '@prisma/client';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().max(500).optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    role: z.nativeEnum(ProjectRole, {
      required_error: 'Valid role is required (ADMIN, MEMBER, VIEWER)',
    }),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.nativeEnum(ProjectRole, {
      required_error: 'Valid role is required (ADMIN, MEMBER, VIEWER)',
    }),
  }),
});
