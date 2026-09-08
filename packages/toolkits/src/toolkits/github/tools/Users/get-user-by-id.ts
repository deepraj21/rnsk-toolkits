// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getUserById = tool({
    description: 'Get a user using their ID.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.number().describe('The ID of the user.'),
    }),
    execute: async ({ githubToken, id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.users.getById({
                account_id: id,
            });
            return data;
        } catch (error: any) {
            return { error: `Failed to get user by ID: ${error.message}` };
        }
    },
});
