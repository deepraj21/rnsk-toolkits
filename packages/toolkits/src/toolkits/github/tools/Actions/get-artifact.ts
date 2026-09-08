// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getArtifact = tool({
    description: 'Get a specific artifact from a GitHub repository by its ID.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        artifact_id: z.number().describe('The unique identifier of the artifact'),
    }),
    execute: async ({ githubToken, owner, repo, artifact_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.actions.getArtifact({
                owner,
                repo,
                artifact_id,
            });
            return {
                id: data.id,
                name: data.name,
                size_in_bytes: data.size_in_bytes,
                created_at: data.created_at,
                expired: data.expired,
                expires_at: data.expires_at,
                workflow_run: data.workflow_run,
            };
        } catch (error: any) {
            return { error: `Failed to get artifact: ${error.message}` };
        }
    },
});
