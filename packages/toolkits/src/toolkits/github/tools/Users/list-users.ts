// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listUsers = tool({
    description: 'List users. Lists all users, in the order that they signed up on GitHub.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        since: z.number().optional().describe('The integer ID of the last User that you\'ve seen.'),
        per_page: z.number().optional().describe('Results per page (max 100).'),
    }),
    execute: async ({ githubToken, since, per_page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.users.list({
                since,
                per_page,
            });
            return data;
        } catch (error: any) {
            return { error: `Failed to list users: ${error.message}` };
        }
    },
});
