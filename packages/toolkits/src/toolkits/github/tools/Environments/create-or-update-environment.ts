// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createOrUpdateEnvironment = tool({
    description: 'Create or update an environment for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        environment_name: z.string().describe('The name of the environment'),
        wait_timer: z.number().optional().describe('The amount of time to delay a deployment after the job is triggered in minutes'),
        reviewers: z.array(z.object({
            type: z.enum(['User', 'Team']),
            id: z.number(),
        })).optional().describe('The people or teams that may review jobs that deploy to this environment'),
        deployment_branch_policy: z.object({
            protected_branches: z.boolean(),
            custom_branch_policies: z.boolean(),
        }).optional().describe('The type of deployment branch policy for this environment'),
    }),
    execute: async ({ githubToken, owner, repo, environment_name, ...options }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.createOrUpdateEnvironment({
                owner,
                repo,
                environment_name,
                ...options,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                name: data.name,
                url: data.url,
                html_url: data.html_url,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };
        } catch (error: any) {
            return { error: `Failed to create or update environment: ${error.message}` };
        }
    },
});
