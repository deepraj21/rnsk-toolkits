// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { redditPost, throwIfJsonErrors } from './client.js';

export const redditCreatePost = tool({
    description:
        'Create a new text (self) or link post in an existing subreddit, optionally applying a flair template ID. Publishes publicly and immediately — confirm subreddit, title, and body with the user before executing. Use redditListSubredditPostFlairs first when the subreddit requires flair.',
    inputSchema: z.object({
        redditToken: z.string().optional().describe('Injected by system; do not provide'),
        subreddit: z.string().describe("Subreddit name without the 'r/' prefix, e.g. 'learnpython'"),
        title: z.string().max(300).describe('Post title, 300 characters or less'),
        kind: z
            .enum(['self', 'link'])
            .optional()
            .describe("Post type: 'self' for text posts, 'link' for URL posts. Inferred from text/url when omitted"),
        text: z.string().optional().describe('Markdown body for a self (text) post'),
        url: z.string().optional().describe('URL for a link post'),
        flairId: z
            .string()
            .optional()
            .describe('Flair template ID for the subreddit (from redditListSubredditPostFlairs), not a display name'),
    }),
    execute: async ({ redditToken, subreddit, title, kind, text, url, flairId }) => {
        try {
            if (!redditToken) {
                return { error: 'Reddit token is required. Connect Reddit first.' };
            }
            const resolvedKind = kind ?? (text ? 'self' : url ? 'link' : undefined);
            if (!resolvedKind) {
                return { error: 'Provide either text (self post) or url (link post), or set kind explicitly.' };
            }
            if (resolvedKind === 'self' && !text) {
                return { error: 'A self post requires text.' };
            }
            if (resolvedKind === 'link' && !url) {
                return { error: 'A link post requires url.' };
            }
            const data = await redditPost(redditToken, '/api/submit', {
                sr: subreddit,
                kind: resolvedKind,
                title,
                text: resolvedKind === 'self' ? text : undefined,
                url: resolvedKind === 'link' ? url : undefined,
                flair_template_id: flairId,
            });
            throwIfJsonErrors(data, 'Create post');
            return data;
        } catch (error) {
            if ((error as any)?.details !== undefined) {
                return { error: 'Failed to create Reddit post', details: (error as any).details };
            }
            return {
                error: 'Error creating Reddit post',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
