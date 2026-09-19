// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const deleteTask = tool({
    description: 'Deletes a task and all of its subtasks. Use only when the user explicitly asks to remove a task.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        taskListId: z.string().describe('The ID of the task list containing the task'),
        taskId: z.string().describe('The ID of the task to delete'),
    }),
    execute: async ({ googleTasksToken, taskListId, taskId }) => {
        try {
            const result = await tasksApiRequest(
                googleTasksToken,
                `/lists/${taskListId}/tasks/${taskId}`,
                { method: 'DELETE' },
            );

            if (!result.ok) {
                return { error: 'Failed to delete task', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error deleting task',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
