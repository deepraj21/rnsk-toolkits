// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const deleteRelease = tool({
    description: 'Delete a release.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        release_id: z.number().describe('The unique identifier of the release'),
    }),
    execute: async ({ githubToken, owner, repo, release_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.repos.deleteRelease({
                owner,
                repo,
                release_id,
            });
            return { message: `Successfully deleted release ${release_id}` };
        } catch (error: any) {
            return { error: `Failed to delete release: ${error.message}` };
        }
    },
});
