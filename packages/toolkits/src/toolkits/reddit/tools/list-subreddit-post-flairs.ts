// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditListSubredditPostFlairs = tool({
    description:
        'List available link/post flair templates for a subreddit, including flair_template_id values. Use before redditCreatePost when the subreddit requires or supports flair.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        subreddit: z.string().describe("Subreddit name without the 'r/' prefix, e.g. 'learnpython'"),
    }),
    execute: async ({ redditToken, subreddit }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            const flairs = await redditGet(redditToken, `/r/${subreddit}/api/link_flair_v2`);
            return { flairs };
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to list subreddit post flairs', details: (error as any).details };
            }
            return {
                error: 'Error listing subreddit post flairs',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
