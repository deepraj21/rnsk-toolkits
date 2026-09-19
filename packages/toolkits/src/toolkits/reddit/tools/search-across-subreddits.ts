// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditSearchAcrossSubreddits = tool({
    description:
        'Search Reddit for posts using a query with Reddit search operators (title:, author:, subreddit:, url:, site:, flair:). Supports sort, time windows, pagination via the after cursor, and restricting to posts (links).',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        searchQuery: z.string().describe('Search query; raw http(s) URLs are not allowed, use url: or site: operators'),
        sort: z
            .enum(['relevance', 'hot', 'new', 'top', 'comments'])
            .optional()
            .default('relevance')
            .describe('Sort order for search results'),
        timeFilter: z
            .enum(['hour', 'day', 'week', 'month', 'year', 'all'])
            .optional()
            .describe('Restrict results to a time period'),
        limit: z.number().min(1).max(100).optional().default(5).describe('Max results to return (max 100)'),
        after: z.string().optional().describe('Pagination cursor for the next page'),
        before: z.string().optional().describe('Pagination cursor for the previous page'),
        restrictSr: z
            .boolean()
            .optional()
            .default(true)
            .describe('Confine the search to posts and comments within subreddits'),
        resultType: z
            .array(z.enum(['sr', 'link', 'user']))
            .optional()
            .describe("Content types to include; must include 'link' for post results"),
    }),
    execute: async ({
        redditToken,
        searchQuery,
        sort = 'relevance',
        timeFilter,
        limit = 5,
        after,
        before,
        restrictSr = true,
        resultType,
    }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            return await redditGet(redditToken, '/search', {
                q: searchQuery,
                sort,
                t: timeFilter,
                limit,
                after,
                before,
                restrict_sr: restrictSr,
                type: resultType?.join(','),
            });
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to search Reddit', details: (error as any).details };
            }
            return {
                error: 'Error searching Reddit',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
