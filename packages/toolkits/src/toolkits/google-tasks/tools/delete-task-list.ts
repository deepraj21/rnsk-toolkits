// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const deleteTaskList = tool({
    description:
        'Deletes a task list and all tasks it contains. Use only when the user explicitly asks to remove a list.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        taskListId: z.string().describe('The ID of the task list to delete'),
    }),
    execute: async ({ googleTasksToken, taskListId }) => {
        try {
            const result = await tasksApiRequest(googleTasksToken, `/users/@me/lists/${taskListId}`, {
                method: 'DELETE',
            });

            if (!result.ok) {
                return { error: 'Failed to delete task list', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error deleting task list',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
