// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const updateTaskList = tool({
    description:
        'Renames an existing task list. Use PATCH semantics — only the title is updated.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        taskListId: z.string().describe('The ID of the task list to update'),
        title: z.string().describe('New title for the task list'),
    }),
    execute: async ({ googleTasksToken, taskListId, title }) => {
        try {
            const result = await tasksApiRequest(googleTasksToken, `/users/@me/lists/${taskListId}`, {
                method: 'PATCH',
                body: { title },
            });

            if (!result.ok) {
                return { error: 'Failed to update task list', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error updating task list',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
