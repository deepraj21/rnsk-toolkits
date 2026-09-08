// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const deleteRef = tool({
    description: 'Delete a reference in a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        ref: z.string().describe('The name of the reference (e.g., heads/branch-name)'),
    }),
    execute: async ({ githubToken, owner, repo, ref }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.git.deleteRef({
                owner,
                repo,
                ref,
            });
            return { message: `Successfully deleted reference ${ref}` };
        } catch (error: any) {
            return { error: `Failed to delete ref: ${error.message}` };
        }
    },
});
