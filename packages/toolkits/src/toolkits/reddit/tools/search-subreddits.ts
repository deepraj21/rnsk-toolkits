// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditSearchSubreddits = tool({
    description:
        'Search for subreddits by title and description to find communities matching a topic or keyword. Returns subscriber counts, descriptions, and metadata. Supports pagination via after/before cursors.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        query: z.string().describe('Search query for subreddit titles and descriptions'),
        sort: z
            .enum(['relevance', 'activity'])
            .optional()
            .default('relevance')
            .describe('Sort order for search results'),
        limit: z.number().min(1).max(100).optional().default(25).describe('Max subreddits to return (max 100)'),
        after: z.string().optional().describe('Fullname cursor for the next page'),
        before: z.string().optional().describe('Fullname cursor for the previous page'),
        count: z.number().min(0).optional().describe('Number of items already seen (pagination)'),
        show: z.string().optional().describe("Pass 'all' to include normally filtered items"),
        showUsers: z.boolean().optional().describe('Include matching users in the results'),
    }),
    execute: async ({ redditToken, query, sort = 'relevance', limit = 25, after, before, count, show, showUsers }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            return await redditGet(redditToken, '/subreddits/search', {
                q: query,
                sort,
                limit,
                after,
                before,
                count,
                show,
                show_users: showUsers,
            });
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to search subreddits', details: (error as any).details };
            }
            return {
                error: 'Error searching subreddits',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
