// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditGet } from './client.js';

export const redditGetSubredditRules = tool({
    description:
        'Get the posting rules for a subreddit to verify content meets community guidelines before posting or commenting. Use before redditCreatePost or redditPostComment in an unfamiliar subreddit.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        subreddit: z.string().describe("Subreddit name without the 'r/' prefix, e.g. 'python'"),
    }),
    execute: async ({ redditToken, subreddit }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            return await redditGet(redditToken, `/r/${subreddit}/about/rules`, { raw_json: 1 });
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to get subreddit rules', details: (error as any).details };
            }
            return {
                error: 'Error getting subreddit rules',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
