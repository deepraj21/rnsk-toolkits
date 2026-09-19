// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const updateTask = tool({
    description:
        'Updates a task title, notes, due date, or status. Use to rename, reschedule, complete (status completed), or reopen (status needsAction) a task. Only provided fields are changed.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        taskListId: z.string().describe('The ID of the task list containing the task'),
        taskId: z.string().describe('The ID of the task to update'),
        title: z.string().optional().describe('New title for the task'),
        notes: z.string().optional().describe('New notes for the task'),
        due: z.string().optional().describe('New due date in RFC 3339 format, e.g. 2026-09-20T00:00:00Z'),
        completed: z.string().optional().describe('Completion timestamp in RFC 3339 format (only with status completed)'),
        status: z.enum(['needsAction', 'completed']).optional().describe('Set completed to finish, needsAction to reopen'),
    }),
    execute: async ({ googleTasksToken, taskListId, taskId, title, notes, due, completed, status }) => {
        try {
            const body: Record<string, unknown> = {};
            if (title !== undefined) body.title = title;
            if (notes !== undefined) body.notes = notes;
            if (due !== undefined) body.due = due;
            if (completed !== undefined) body.completed = completed;
            if (status !== undefined) body.status = status;
            const result = await tasksApiRequest(
                googleTasksToken,
                `/lists/${taskListId}/tasks/${taskId}`,
                {
                    method: 'PATCH',
                    body,
                },
            );

            if (!result.ok) {
                return { error: 'Failed to update task', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error updating task',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
