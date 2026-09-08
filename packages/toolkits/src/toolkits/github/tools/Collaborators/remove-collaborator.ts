// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const removeCollaborator = tool({
    description: 'Remove a repository collaborator.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        username: z.string().describe('Username to remove'),
    }),
    execute: async ({ githubToken, owner, repo, username }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.repos.removeCollaborator({
                owner,
                repo,
                username,
            });
            return { message: `Successfully removed ${username} as collaborator` };
        } catch (error: any) {
            return { error: `Failed to remove collaborator: ${error.message}` };
        }
    },
});
