// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getUserContext = tool({
    description: 'Get contextual information for a user. Provides the interaction context between the authenticated user and another user.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        username: z.string().describe('The handle for the GitHub user account.'),
        subject_type: z.enum(['organization', 'repository', 'issue', 'pull_request']).optional().describe('The type of subject to check context for.'),
        subject_id: z.string().optional().describe('The ID of the subject.'),
    }),
    execute: async ({ githubToken, username, subject_type, subject_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            // @ts-ignore - The types might be slightly off for this specific endpoint depending on octokit version
            const { data } = await octokit.rest.users.getContextForUser({
                username,
                subject_type: subject_type as any,
                subject_id,
            });
            return data;
        } catch (error: any) {
            return { error: `Failed to get user context: ${error.message}` };
        }
    },
});
