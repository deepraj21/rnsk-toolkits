// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listProjectColumns = tool({
    description: 'List columns for a project.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        project_id: z.number().describe('The unique identifier of the project'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, project_id, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await (octokit.rest.projects as any).listColumns({
                project_id,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return (data as any[]).map((column: any) => ({
                id: column.id,
                name: column.name,
                project_url: column.project_url,
                cards_url: column.cards_url,
                created_at: column.created_at,
                updated_at: column.updated_at,
            }));
        } catch (error: any) {
            return { error: `Failed to list project columns: ${error.message}` };
        }
    },
});
