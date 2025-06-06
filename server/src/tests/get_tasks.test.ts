
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { getTasks } from '../handlers/get_tasks';

describe('getTasks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no tasks exist', async () => {
    const result = await getTasks();
    expect(result).toEqual([]);
  });

  it('should return all tasks', async () => {
    // Create test tasks
    await db.insert(tasksTable)
      .values([
        {
          title: 'First Task',
          description: 'First task description',
          completed: false
        },
        {
          title: 'Second Task',
          description: null,
          completed: true
        }
      ])
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(2);
    
    // Verify task properties
    expect(result[0].title).toBeDefined();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    expect(typeof result[0].completed).toBe('boolean');
    
    // Check that both tasks are present
    const titles = result.map(task => task.title);
    expect(titles).toContain('First Task');
    expect(titles).toContain('Second Task');
  });

  it('should return tasks ordered by created_at descending', async () => {
    // Create tasks with slight delay to ensure different timestamps
    await db.insert(tasksTable)
      .values({
        title: 'Older Task',
        description: 'Created first'
      })
      .execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(tasksTable)
      .values({
        title: 'Newer Task',
        description: 'Created second'
      })
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Newer Task');
    expect(result[1].title).toEqual('Older Task');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should handle tasks with nullable description', async () => {
    await db.insert(tasksTable)
      .values([
        {
          title: 'Task with description',
          description: 'Has description'
        },
        {
          title: 'Task without description',
          description: null
        }
      ])
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(2);
    
    const taskWithDesc = result.find(task => task.title === 'Task with description');
    const taskWithoutDesc = result.find(task => task.title === 'Task without description');
    
    expect(taskWithDesc?.description).toEqual('Has description');
    expect(taskWithoutDesc?.description).toBeNull();
  });
});
