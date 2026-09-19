// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const getTaskList = tool({
    description:
        'Retrieves a single task list by ID, including its title, ID, and last-updated timestamp.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        taskListId: z.string().describe('The ID of the task list to retrieve'),
    }),
    execute: async ({ googleTasksToken, taskListId }) => {
        try {
            const result = await tasksApiRequest(googleTasksToken, `/users/@me/lists/${taskListId}`);

            if (!result.ok) {
                return { error: 'Failed to get task list', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error getting task list',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
