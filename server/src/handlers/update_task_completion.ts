
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskCompletionInput, type Task } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTaskCompletion = async (input: UpdateTaskCompletionInput): Promise<Task> => {
  try {
    // Update task completion status and updated_at timestamp
    const result = await db.update(tasksTable)
      .set({
        completed: input.completed,
        updated_at: new Date()
      })
      .where(eq(tasksTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Task with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Task completion update failed:', error);
    throw error;
  }
};
