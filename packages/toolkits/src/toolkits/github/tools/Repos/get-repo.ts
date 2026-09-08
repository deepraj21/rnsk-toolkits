// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getRepo = tool({
    description: 'Get detailed information about a specific GitHub repository. Returns stars, forks, issues count, description, etc.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
    }),
    execute: async ({ githubToken, owner, repo }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.get({
                owner,
                repo,
            });
            return {
                name: data.name,
                full_name: data.full_name,
                description: data.description,
                private: data.private,
                html_url: data.html_url,
                clone_url: data.clone_url,
                stars: data.stargazers_count,
                forks: data.forks_count,
                open_issues: data.open_issues_count,
                default_branch: data.default_branch,
                created_at: data.created_at,
                updated_at: data.updated_at,
                language: data.language,
            };
        } catch (error: any) {
            return { error: `Failed to get repo: ${error.message}` };
        }
    },
});
