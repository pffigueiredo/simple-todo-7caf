
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type DeleteTaskInput, type CreateTaskInput } from '../schema';
import { deleteTask } from '../handlers/delete_task';
import { eq } from 'drizzle-orm';

// Test inputs
const createTaskInput: CreateTaskInput = {
  title: 'Test Task',
  description: 'A task for testing deletion'
};

describe('deleteTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing task', async () => {
    // Create a task first
    const createResult = await db.insert(tasksTable)
      .values({
        title: createTaskInput.title,
        description: createTaskInput.description
      })
      .returning()
      .execute();

    const createdTask = createResult[0];
    expect(createdTask.id).toBeDefined();

    // Delete the task
    const deleteInput: DeleteTaskInput = {
      id: createdTask.id
    };

    await deleteTask(deleteInput);

    // Verify task is deleted
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(tasks).toHaveLength(0);
  });

  it('should not throw error when deleting non-existent task', async () => {
    const deleteInput: DeleteTaskInput = {
      id: 999999 // Non-existent ID
    };

    // Should not throw an error
    await expect(deleteTask(deleteInput)).resolves.toBeUndefined();
  });

  it('should only delete the specified task', async () => {
    // Create multiple tasks
    const task1Result = await db.insert(tasksTable)
      .values({
        title: 'Task 1',
        description: 'First task'
      })
      .returning()
      .execute();

    const task2Result = await db.insert(tasksTable)
      .values({
        title: 'Task 2',
        description: 'Second task'
      })
      .returning()
      .execute();

    const task1 = task1Result[0];
    const task2 = task2Result[0];

    // Delete only the first task
    const deleteInput: DeleteTaskInput = {
      id: task1.id
    };

    await deleteTask(deleteInput);

    // Verify only task1 is deleted
    const remainingTasks = await db.select()
      .from(tasksTable)
      .execute();

    expect(remainingTasks).toHaveLength(1);
    expect(remainingTasks[0].id).toEqual(task2.id);
    expect(remainingTasks[0].title).toEqual('Task 2');
  });
});
