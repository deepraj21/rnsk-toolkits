// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const createTaskList = tool({
    description:
        'Creates a new task list with the given title. Use when the user wants a new list to organize tasks.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        title: z.string().describe('Title of the new task list'),
    }),
    execute: async ({ googleTasksToken, title }) => {
        try {
            const result = await tasksApiRequest(googleTasksToken, '/users/@me/lists', {
                method: 'POST',
                body: { title },
            });

            if (!result.ok) {
                return { error: 'Failed to create task list', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error creating task list',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
