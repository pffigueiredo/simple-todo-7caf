
import { z } from 'zod';

// Task schema
export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Task = z.infer<typeof taskSchema>;

// Input schema for creating tasks
export const createTaskInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional()
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

// Input schema for updating task completion status
export const updateTaskCompletionInputSchema = z.object({
  id: z.number(),
  completed: z.boolean()
});

export type UpdateTaskCompletionInput = z.infer<typeof updateTaskCompletionInputSchema>;

// Input schema for deleting tasks
export const deleteTaskInputSchema = z.object({
  id: z.number()
});

export type DeleteTaskInput = z.infer<typeof deleteTaskInputSchema>;
