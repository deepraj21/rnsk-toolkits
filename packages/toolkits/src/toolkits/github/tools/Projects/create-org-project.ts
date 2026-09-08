// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createOrgProject = tool({
    description: 'Create an organization project.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
        name: z.string().describe('The name of the project'),
        body: z.string().optional().describe('The body of the project'),
    }),
    execute: async ({ githubToken, org, name, body }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await (octokit.rest.projects as any).createForOrg({
                org,
                name,
                body,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            const d = data as any;
            return {
                id: d.id,
                name: d.name,
                body: d.body,
                number: d.number,
                state: d.state,
                html_url: d.html_url,
                created_at: d.created_at,
                updated_at: d.updated_at,
            };
        } catch (error: any) {
            return { error: `Failed to create org project: ${error.message}` };
        }
    },
});
