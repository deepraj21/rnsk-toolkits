// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getUser = tool({
    description: 'Get a user. Provides publicly available information about someone with a GitHub account.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        username: z.string().describe('The handle for the GitHub user account.'),
    }),
    execute: async ({ githubToken, username }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.users.getByUsername({
                username,
            });
            return data;
        } catch (error: any) {
            return { error: `Failed to get user: ${error.message}` };
        }
    },
});
