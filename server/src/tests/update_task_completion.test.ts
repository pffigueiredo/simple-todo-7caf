
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskCompletionInput } from '../schema';
import { updateTaskCompletion } from '../handlers/update_task_completion';
import { eq } from 'drizzle-orm';

describe('updateTaskCompletion', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update task completion to true', async () => {
    // Create a task directly in database for testing
    const createResult = await db.insert(tasksTable)
      .values({
        title: 'Test Task',
        description: 'A task for testing',
        completed: false
      })
      .returning()
      .execute();
    
    const createdTask = createResult[0];

    // Update task completion
    const updateInput: UpdateTaskCompletionInput = {
      id: createdTask.id,
      completed: true
    };
    const result = await updateTaskCompletion(updateInput);

    // Verify the result
    expect(result.id).toEqual(createdTask.id);
    expect(result.title).toEqual('Test Task');
    expect(result.description).toEqual('A task for testing');
    expect(result.completed).toBe(true);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(createdTask.updated_at.getTime());
  });

  it('should update task completion to false', async () => {
    // Create a completed task directly in database
    const createResult = await db.insert(tasksTable)
      .values({
        title: 'Completed Task',
        description: null,
        completed: true
      })
      .returning()
      .execute();
    
    const createdTask = createResult[0];

    // Mark it as incomplete
    const updateInput: UpdateTaskCompletionInput = {
      id: createdTask.id,
      completed: false
    };
    const result = await updateTaskCompletion(updateInput);

    // Verify the result
    expect(result.id).toEqual(createdTask.id);
    expect(result.title).toEqual('Completed Task');
    expect(result.description).toBeNull();
    expect(result.completed).toBe(false);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated completion status to database', async () => {
    // Create a task directly in database
    const createResult = await db.insert(tasksTable)
      .values({
        title: 'Database Test Task',
        description: 'Testing database persistence',
        completed: false
      })
      .returning()
      .execute();
    
    const createdTask = createResult[0];

    // Update task completion
    const updateInput: UpdateTaskCompletionInput = {
      id: createdTask.id,
      completed: true
    };
    await updateTaskCompletion(updateInput);

    // Query database directly to verify
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].completed).toBe(true);
    expect(tasks[0].updated_at).toBeInstanceOf(Date);
    expect(tasks[0].updated_at.getTime()).toBeGreaterThan(createdTask.updated_at.getTime());
  });

  it('should throw error for non-existent task', async () => {
    const updateInput: UpdateTaskCompletionInput = {
      id: 999999,
      completed: true
    };

    await expect(updateTaskCompletion(updateInput)).rejects.toThrow(/task with id 999999 not found/i);
  });
});
