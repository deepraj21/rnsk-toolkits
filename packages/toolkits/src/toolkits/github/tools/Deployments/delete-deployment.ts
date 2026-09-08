// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const deleteDeployment = tool({
    description: 'Delete a deployment from a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        deployment_id: z.number().describe('The unique identifier of the deployment'),
    }),
    execute: async ({ githubToken, owner, repo, deployment_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.repos.deleteDeployment({
                owner,
                repo,
                deployment_id,
            });
            return { message: `Successfully deleted deployment ${deployment_id}` };
        } catch (error: any) {
            return { error: `Failed to delete deployment: ${error.message}` };
        }
    },
});
