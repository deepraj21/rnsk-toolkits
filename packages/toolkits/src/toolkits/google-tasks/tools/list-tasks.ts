// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const listTasks = tool({
    description:
        'Lists tasks in a task list with optional filters. Use to view open tasks, completed tasks, or tasks due within a range. Defaults to hiding completed and deleted tasks.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        taskListId: z.string().describe('The ID of the task list to list tasks from'),
        showCompleted: z.boolean().optional().describe('Include completed tasks (default false)'),
        showDeleted: z.boolean().optional().describe('Include deleted tasks (default false)'),
        showHidden: z.boolean().optional().describe('Include hidden tasks (default false)'),
        maxResults: z.number().optional().describe('Maximum number of tasks to return (max 100)'),
        pageToken: z.string().optional().describe('Token for fetching the next page of results'),
        updatedMin: z.string().optional().describe('Only return tasks updated after this RFC 3339 timestamp'),
        dueMin: z.string().optional().describe('Only return tasks due after this RFC 3339 timestamp'),
        dueMax: z.string().optional().describe('Only return tasks due before this RFC 3339 timestamp'),
        completedMin: z.string().optional().describe('Only return tasks completed after this RFC 3339 timestamp (requires showCompleted true)'),
        completedMax: z.string().optional().describe('Only return tasks completed before this RFC 3339 timestamp (requires showCompleted true)'),
    }),
    execute: async ({
        googleTasksToken,
        taskListId,
        showCompleted,
        showDeleted,
        showHidden,
        maxResults,
        pageToken,
        updatedMin,
        dueMin,
        dueMax,
        completedMin,
        completedMax,
    }) => {
        try {
            const result = await tasksApiRequest(googleTasksToken, `/lists/${taskListId}/tasks`, {
                searchParams: {
                    showCompleted,
                    showDeleted,
                    showHidden,
                    maxResults,
                    pageToken,
                    updatedMin,
                    dueMin,
                    dueMax,
                    completedMin,
                    completedMax,
                },
            });

            if (!result.ok) {
                return { error: 'Failed to list tasks', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error listing tasks',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
