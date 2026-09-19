// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { tasksApiRequest } from './utils.js';

export const listTaskLists = tool({
    description:
        'Lists all task lists owned by the authenticated user. Use to discover available task lists before reading or managing tasks.',
    inputSchema: z.object({
        googleTasksToken: z.string().describe('The Google Tasks access token'),
        maxResults: z.number().optional().describe('Maximum number of task lists to return (max 100)'),
        pageToken: z.string().optional().describe('Token for fetching the next page of results'),
    }),
    execute: async ({ googleTasksToken, maxResults, pageToken }) => {
        try {
            const result = await tasksApiRequest(googleTasksToken, '/users/@me/lists', {
                searchParams: { maxResults, pageToken },
            });

            if (!result.ok) {
                return { error: 'Failed to list task lists', details: result.error };
            }

            return result.data;
        } catch (error) {
            return {
                error: 'Error listing task lists',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
