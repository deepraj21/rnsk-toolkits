// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const getTask = tool({
    description:
        'Retrieves a single task by ID, including title, notes, status, due date, and position.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        taskListId: z.string().describe('The ID of the task list containing the task'),
        taskId: z.string().describe('The ID of the task to retrieve'),
    }),
    execute: async ({ googleTasksToken, taskListId, taskId }) => {
        try {
            const result = await tasksApiRequest(
                googleTasksToken,
                `/lists/${taskListId}/tasks/${taskId}`,
            );

            if (!result.ok) {
                return { error: 'Failed to get task', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error getting task',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
