// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const checkCollaborator = tool({
    description: 'Check if a user is a repository collaborator.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        username: z.string().describe('Username to check'),
    }),
    execute: async ({ githubToken, owner, repo, username }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.repos.checkCollaborator({
                owner,
                repo,
                username,
            });
            return { is_collaborator: true };
        } catch (error: any) {
            if (error.status === 404) {
                return { is_collaborator: false };
            }
            return { error: `Failed to check collaborator: ${error.message}` };
        }
    },
});
