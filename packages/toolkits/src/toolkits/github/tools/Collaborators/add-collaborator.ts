// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const addCollaborator = tool({
    description: 'Add a repository collaborator.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        username: z.string().describe('Username to add as collaborator'),
        permission: z.enum(['pull', 'push', 'admin', 'maintain', 'triage']).optional().describe('Permission level'),
    }),
    execute: async ({ githubToken, owner, repo, username, permission }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.repos.addCollaborator({
                owner,
                repo,
                username,
                permission: permission ?? 'push',
            });
            return { message: `Successfully added ${username} as collaborator` };
        } catch (error: any) {
            return { error: `Failed to add collaborator: ${error.message}` };
        }
    },
});
