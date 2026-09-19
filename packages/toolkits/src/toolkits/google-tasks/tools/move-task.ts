// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const moveTask = tool({
    description:
        'Moves a task to a new position, optionally under a different parent or to a different task list. Use to reorder tasks, convert a task into a subtask, or move across lists (set destinationTaskListId).',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        taskListId: z.string().describe('The ID of the task list containing the task'),
        taskId: z.string().describe('The ID of the task to move'),
        parent: z.string().optional().describe('New parent task ID to nest under (omit for top level)'),
        previous: z.string().optional().describe('Sibling task ID to place this task after'),
        destinationTaskListId: z
            .string()
            .optional()
            .describe('Destination task list ID to move across lists (omit to reorder within the same list)'),
    }),
    execute: async ({ googleTasksToken, taskListId, taskId, parent, previous, destinationTaskListId }) => {
        try {
            const result = await tasksApiRequest(
                googleTasksToken,
                `/lists/${taskListId}/tasks/${taskId}/move`,
                {
                    method: 'POST',
                    searchParams: { parent, previous, destinationTasklist: destinationTaskListId },
                },
            );

            if (!result.ok) {
                return { error: 'Failed to move task', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error moving task',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
