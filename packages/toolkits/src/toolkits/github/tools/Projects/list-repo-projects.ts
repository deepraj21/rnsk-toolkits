// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listRepoProjects = tool({
    description: 'List repository projects.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        state: z.enum(['open', 'closed', 'all']).optional().describe('Filter projects by state'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, state, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await (octokit.rest.projects as any).listForRepo({
                owner,
                repo,
                state: state ?? 'open',
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return (data as any[]).map((project: any) => ({
                id: project.id,
                name: project.name,
                body: project.body,
                number: project.number,
                state: project.state,
                creator: project.creator?.login,
                html_url: project.html_url,
                created_at: project.created_at,
                updated_at: project.updated_at,
            }));
        } catch (error: any) {
            return { error: `Failed to list repo projects: ${error.message}` };
        }
    },
});
