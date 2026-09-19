// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const clearTasks = tool({
    description:
        'Clears all completed tasks from a task list. Use to tidy up a list after tasks are done.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        taskListId: z.string().describe('The ID of the task list to clear completed tasks from'),
    }),
    execute: async ({ googleTasksToken, taskListId }) => {
        try {
            const result = await tasksApiRequest(googleTasksToken, `/lists/${taskListId}/clear`, {
                method: 'POST',
            });

            if (!result.ok) {
                return { error: 'Failed to clear completed tasks', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error clearing completed tasks',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
