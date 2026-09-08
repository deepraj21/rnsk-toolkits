// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getDeployment = tool({
    description: 'Get a specific deployment information.',
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
            const { data } = await octokit.rest.repos.getDeployment({
                owner,
                repo,
                deployment_id,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                sha: data.sha,
                ref: data.ref,
                task: data.task,
                environment: data.environment,
                description: data.description,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };
        } catch (error: any) {
            return { error: `Failed to get deployment: ${error.message}` };
        }
    },
});
