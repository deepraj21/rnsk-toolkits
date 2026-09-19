// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditGetControversialPosts = tool({
    description:
        'Get controversial posts from across all of Reddit, ranked by controversy within a time window (hour, day, week, month, year, or all-time). Supports pagination via after/before cursors.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        timeFilter: z
            .enum(['hour', 'day', 'week', 'month', 'year', 'all'])
            .optional()
            .default('all')
            .describe('Time window for ranking controversial posts'),
        limit: z.number().min(1).max(100).optional().default(25).describe('Max posts to return (max 100)'),
        after: z.string().optional().describe('Fullname cursor for the next page'),
        before: z.string().optional().describe('Fullname cursor for the previous page'),
        count: z.number().min(0).optional().describe('Number of items already seen (pagination)'),
        show: z.string().optional().describe("Pass 'all' to include normally filtered items"),
    }),
    execute: async ({ redditToken, timeFilter = 'all', limit = 25, after, before, count, show }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            return await redditGet(redditToken, '/controversial', {
                t: timeFilter,
                limit,
                after,
                before,
                count,
                show,
            });
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to get controversial posts', details: (error as any).details };
            }
            return {
                error: 'Error getting controversial posts',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
