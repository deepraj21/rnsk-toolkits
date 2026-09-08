// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getRateLimit = tool({
    description: 'Get rate limit status of the authenticated user.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
    }),
    execute: async ({ githubToken }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.rateLimit.get();
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.resources;
        } catch (error: any) {
            return { error: `Failed to get rate limit: ${error.message}` };
        }
    },
});
