// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listDeployments = tool({
    description: 'List deployments for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        environment: z.string().optional().describe('The name of the environment that was deployed to'),
        ref: z.string().optional().describe('The name of the ref to search for'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, environment, ref, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.listDeployments({
                owner,
                repo,
                environment,
                ref,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                deployments: data.map(deployment => ({
                    id: deployment.id,
                    sha: deployment.sha,
                    ref: deployment.ref,
                    task: deployment.task,
                    environment: deployment.environment,
                    description: deployment.description,
                    created_at: deployment.created_at,
                    updated_at: deployment.updated_at,
                    statuses_url: deployment.statuses_url,
                    repository_url: deployment.repository_url,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list deployments: ${error.message}` };
        }
    },
});
