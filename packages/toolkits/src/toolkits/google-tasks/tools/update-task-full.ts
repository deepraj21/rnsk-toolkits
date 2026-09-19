// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const updateTaskFull = tool({
    description:
        'Fully replaces a task via PUT. Use when you need to rewrite the entire task resource, not just patch fields. Requires id (must match taskId) and title; unlike PATCH, omitted optional fields are cleared to defaults.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        taskListId: z.string().describe('The ID of the task list containing the task'),
        taskId: z.string().describe('The ID of the task to fully replace'),
        id: z.string().describe('Task identifier for the request body (REQUIRED, must match taskId)'),
        title: z.string().min(1).max(1024).describe('Title of the task (REQUIRED)'),
        notes: z.string().max(8192).optional().describe('Notes for the task (plain text)'),
        due: z.string().optional().describe('Due date in RFC 3339 format, e.g. 2026-09-20T00:00:00Z'),
        completed: z.string().optional().describe('Completion timestamp in RFC 3339 format (only with status completed)'),
        status: z.enum(['needsAction', 'completed']).optional().describe('Task status'),
        deleted: z.boolean().optional().describe('Whether the task is marked deleted'),
        etag: z.string().optional().describe('ETag for optimistic concurrency control'),
    }),
    execute: async ({ googleTasksToken, taskListId, taskId, id, title, notes, due, completed, status, deleted, etag }) => {
        try {
            if (id !== taskId) {
                return { error: `Body id '${id}' must match taskId '${taskId}' for full replacement` };
            }
            const body: Record<string, unknown> = { id, title };
            if (notes !== undefined) body.notes = notes;
            if (due !== undefined) body.due = due;
            if (completed !== undefined) body.completed = completed;
            if (status !== undefined) body.status = status;
            if (deleted !== undefined) body.deleted = deleted;
            if (etag !== undefined) body.etag = etag;

            const result = await tasksApiRequest(googleTasksToken, `/lists/${taskListId}/tasks/${taskId}`, {
                method: 'PUT',
                body,
            });

            if (!result.ok) {
                return { error: 'Failed to fully update task', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error fully updating task',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
