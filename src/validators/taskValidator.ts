import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(2000).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assigneeId: z.string().uuid('Invalid assignee ID').optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: z.string().datetime().optional().nullable(),
  }),
});

export const assignTaskSchema = z.object({
  body: z.object({
    assigneeId: z.string().uuid('Invalid assignee ID').nullable(),
  }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(TaskStatus, {
      required_error: 'Valid status is required (TODO, IN_PROGRESS, REVIEW, DONE)',
    }),
  }),
});
