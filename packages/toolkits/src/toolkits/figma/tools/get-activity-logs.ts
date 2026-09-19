// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getActivityLogs = tool({
    description:
        'Retrieves org activity log events with type, time-range, and pagination filters. Defaults: last year to now, 1000 per page, ascending.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        events: z.string().optional().describe("Comma-separated event types, e.g. 'file_viewed,file_commented'"),
        startTime: z.number().optional().describe('Unix timestamp lower bound (default one year ago)'),
        endTime: z.number().optional().describe('Unix timestamp upper bound (default now)'),
        limit: z.number().optional().describe('Events per page (default 1000)'),
        order: z.enum(['asc', 'desc']).optional().describe('Sort by timestamp (default asc)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ figmaToken, events, startTime, endTime, limit, order, cursor }) => {
        try {
            const result = await figmaRequest(figmaToken, '/v1/activity_logs', {
                query: { events, start_time: startTime, end_time: endTime, limit, order, cursor },
            });
            if (!result.ok) return { error: 'Failed to get activity logs', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting activity logs',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
