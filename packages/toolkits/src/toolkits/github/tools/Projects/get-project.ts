// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getProject = tool({
    description: 'Get a project.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        project_id: z.number().describe('The unique identifier of the project'),
    }),
    execute: async ({ githubToken, project_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await (octokit.rest.projects as any).get({
                project_id,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            const d = data as any;
            return {
                id: d.id,
                name: d.name,
                body: d.body,
                number: d.number,
                state: d.state,
                creator: d.creator?.login,
                html_url: d.html_url,
                created_at: d.created_at,
                updated_at: d.updated_at,
                organization_permission: d.organization_permission,
                owner_url: d.owner_url,
            };
        } catch (error: any) {
            return { error: `Failed to get project: ${error.message}` };
        }
    },
});
