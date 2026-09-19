// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditRetrievePostsFromSubreddit = tool({
    description:
        'Get posts from a public subreddit sorted by hot, new, top, rising, or controversial. Post data is nested under data.children[].data; paginate with the data.after cursor. Compare created_utc client-side for date filtering. Also covers new/top listings (set timeFilter for top/controversial windows).',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        subreddit: z.string().describe("Subreddit name without the 'r/' prefix, e.g. 'technology'"),
        sort: z
            .enum(['hot', 'new', 'top', 'rising', 'controversial'])
            .optional()
            .default('hot')
            .describe('Sort order for posts'),
        timeFilter: z
            .enum(['hour', 'day', 'week', 'month', 'year', 'all'])
            .optional()
            .describe("Time window for 'top' and 'controversial' sorts"),
        maxResults: z
            .number()
            .min(0)
            .max(100)
            .optional()
            .default(5)
            .describe('Max posts to return (max 100); 0 means maximum'),
        after: z.string().optional().describe('Fullname cursor for the next page'),
        before: z.string().optional().describe('Fullname cursor for the previous page'),
        count: z.number().min(0).optional().describe('Number of items already seen (pagination)'),
        show: z.string().optional().describe("Pass 'all' to include normally filtered items"),
    }),
    execute: async ({
        redditToken,
        subreddit,
        sort = 'hot',
        timeFilter,
        maxResults = 5,
        after,
        before,
        count,
        show,
    }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            return await redditGet(redditToken, `/r/${subreddit}/${sort}`, {
                t: timeFilter,
                limit: maxResults === 0 ? 100 : maxResults,
                after,
                before,
                count,
                show,
            });
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to retrieve posts from subreddit', details: (error as any).details };
            }
            return {
                error: 'Error retrieving posts from subreddit',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
