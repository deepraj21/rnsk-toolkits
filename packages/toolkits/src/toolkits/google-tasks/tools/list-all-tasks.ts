// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const listAllTasks = tool({
    description:
        'Lists all tasks across all task lists with optional filters. Use when you need to see everything without knowing which list to query first. Each task is annotated with tasklistId and tasklistTitle.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        showCompleted: z.boolean().optional().describe('Include completed tasks (default true)'),
        showDeleted: z.boolean().optional().describe('Include deleted tasks (default false)'),
        showHidden: z.boolean().optional().describe('Include hidden tasks (default false)'),
        showAssigned: z.boolean().optional().describe('Include tasks assigned from Docs/Chat (default false)'),
        dueMin: z.string().optional().describe('Only include tasks due on or after this RFC 3339 timestamp'),
        dueMax: z.string().optional().describe('Only include tasks due on or before this RFC 3339 timestamp'),
        completedMin: z.string().optional().describe('Only include tasks completed on or after this RFC 3339 timestamp'),
        completedMax: z.string().optional().describe('Only include tasks completed on or before this RFC 3339 timestamp'),
        updatedMin: z.string().optional().describe('Only include tasks updated on or after this RFC 3339 timestamp'),
        maxTasksTotal: z
            .number()
            .min(1)
            .max(100000)
            .optional()
            .describe('Hard limit on total tasks returned across all lists (default 1000)'),
    }),
    execute: async ({
        googleTasksToken,
        showCompleted,
        showDeleted,
        showHidden,
        showAssigned,
        dueMin,
        dueMax,
        completedMin,
        completedMax,
        updatedMin,
        maxTasksTotal,
    }) => {
        try {
            const limit = maxTasksTotal ?? 1000;

            // 1. Fetch all task lists (paginate).
            const tasklists: Array<{ id: string; title?: string }> = [];
            let pageToken: string | undefined;
            do {
                const listsResult = await tasksApiRequest(googleTasksToken, '/users/@me/lists', {
                    searchParams: { maxResults: 100, pageToken },
                });
                if (!listsResult.ok) {
                    return { error: 'Failed to list task lists', details: listsResult.error };
                }
                const data = listsResult.data as { items?: Array<{ id: string; title?: string }>; nextPageToken?: string };
                for (const item of data.items ?? []) {
                    if (item?.id) tasklists.push({ id: item.id, title: item.title });
                }
                pageToken = data.nextPageToken;
            } while (pageToken);

            // 2. Fetch tasks per list with the same filters.
            const tasks: Array<Record<string, unknown>> = [];
            const listsMeta: Array<Record<string, unknown>> = [];
            let truncated = false;

            for (const list of tasklists) {
                let listPageToken: string | undefined;
                let countForList = 0;
                do {
                    if (tasks.length >= limit) {
                        truncated = true;
                        break;
                    }
                    const result = await tasksApiRequest(googleTasksToken, `/lists/${list.id}/tasks`, {
                        searchParams: {
                            showCompleted: showCompleted ?? true,
                            showDeleted,
                            showHidden,
                            showAssigned,
                            dueMin,
                            dueMax,
                            completedMin,
                            completedMax,
                            updatedMin,
                            maxResults: 100,
                            pageToken: listPageToken,
                        },
                    });
                    if (!result.ok) {
                        return { error: `Failed to list tasks for list ${list.id}`, details: result.error };
                    }
                    const data = result.data as { items?: Array<Record<string, unknown>>; nextPageToken?: string };
                    for (const item of data.items ?? []) {
                        if (tasks.length >= limit) {
                            truncated = true;
                            break;
                        }
                        tasks.push({ ...item, tasklistId: list.id, tasklistTitle: list.title });
                        countForList += 1;
                    }
                    listPageToken = data.nextPageToken;
                } while (listPageToken && !truncated);
                listsMeta.push({ id: list.id, title: list.title, taskCount: countForList });
                if (truncated) break;
            }

            return {
                tasks,
                tasklists: listsMeta,
                totalTasks: tasks.length,
                totalLists: tasklists.length,
                truncated,
            };
        } catch (error) {
            return {
                error: 'Error listing all tasks',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
