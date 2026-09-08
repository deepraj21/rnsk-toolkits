// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getEnvironment = tool({
    description: 'Get a specific environment info for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        environment_name: z.string().describe('The name of the environment'),
    }),
    execute: async ({ githubToken, owner, repo, environment_name }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.getEnvironment({
                owner,
                repo,
                environment_name,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                name: data.name,
                url: data.url,
                html_url: data.html_url,
                created_at: data.created_at,
                updated_at: data.updated_at,
                protection_rules: data.protection_rules,
                deployment_branch_policy: data.deployment_branch_policy,
            };
        } catch (error: any) {
            return { error: `Failed to get environment: ${error.message}` };
        }
    },
});
