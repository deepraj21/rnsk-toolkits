// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const createTask = tool({
    description:
        'Creates a new task in a task list. Use to add to-dos with optional notes, due date, subtask parent, or position.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        taskListId: z.string().describe('The ID of the task list to create the task in'),
        title: z.string().describe('Title of the task'),
        notes: z.string().optional().describe('Notes or details for the task'),
        due: z.string().optional().describe('Due date in RFC 3339 format, e.g. 2026-09-20T00:00:00Z'),
        completed: z.string().optional().describe('Completion timestamp in RFC 3339 format (only with status completed)'),
        status: z.enum(['needsAction', 'completed']).optional().describe('Initial status (default needsAction)'),
        parent: z.string().optional().describe('Parent task ID to create this as a subtask'),
        previous: z.string().optional().describe('Sibling task ID to insert this task after'),
    }),
    execute: async ({
        googleTasksToken,
        taskListId,
        title,
        notes,
        due,
        completed,
        status,
        parent,
        previous,
    }) => {
        try {
            const body: Record<string, unknown> = { title };
            if (notes !== undefined) body.notes = notes;
            if (due !== undefined) body.due = due;
            if (completed !== undefined) body.completed = completed;
            if (status !== undefined) body.status = status;
            const result = await tasksApiRequest(googleTasksToken, `/lists/${taskListId}/tasks`, {
                method: 'POST',
                body,
                searchParams: { parent, previous },
            });

            if (!result.ok) {
                return { error: 'Failed to create task', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error creating task',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
