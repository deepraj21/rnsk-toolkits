// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditGetListingBySort = tool({
    description:
        'Get a listing of posts from the Reddit front page sorted by hot, new, top, rising, controversial, or best. Supports pagination (after/before) and time filtering for top and controversial sorts. For random posts use redditGetRandomPost instead.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        sort: z
            .enum(['hot', 'new', 'top', 'rising', 'controversial', 'best'])
            .describe('Sort order for the listing'),
        timeFilter: z
            .enum(['hour', 'day', 'week', 'month', 'year', 'all'])
            .optional()
            .describe("Time window for 'top' and 'controversial' sorts"),
        limit: z.number().min(1).max(100).optional().default(25).describe('Max posts to return (max 100)'),
        after: z.string().optional().describe('Fullname cursor for the next page'),
        before: z.string().optional().describe('Fullname cursor for the previous page'),
        count: z.number().min(0).optional().describe('Number of items already seen (pagination)'),
        show: z.string().optional().describe("Pass 'all' to include normally filtered items"),
    }),
    execute: async ({ redditToken, sort, timeFilter, limit = 25, after, before, count, show }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            return await redditGet(redditToken, `/${sort}`, {
                t: timeFilter,
                limit,
                after,
                before,
                count,
                show,
            });
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to get Reddit listing', details: (error as any).details };
            }
            return {
                error: 'Error getting Reddit listing',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
