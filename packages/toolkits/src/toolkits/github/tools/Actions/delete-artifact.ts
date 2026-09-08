// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const deleteArtifact = tool({
    description: 'Delete an artifact from a GitHub repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        artifact_id: z.number().describe('The unique identifier of the artifact to delete'),
    }),
    execute: async ({ githubToken, owner, repo, artifact_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.actions.deleteArtifact({
                owner,
                repo,
                artifact_id,
            });
            return { message: `Successfully deleted artifact ${artifact_id}` };
        } catch (error: any) {
            return { error: `Failed to delete artifact: ${error.message}` };
        }
    },
});
