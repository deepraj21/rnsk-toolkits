// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getAuthenticatedApp = tool({
    description: 'Get the authenticated GitHub App. Returns information about the authenticated app.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
    }),
    execute: async ({ githubToken }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.apps.getAuthenticated();
            if (!data) {
                return { error: 'No data returned from GitHub API' };
            }
            return {
                id: data.id,
                name: data.name,
                slug: data.slug,
                owner: (data.owner as any)?.login || (data.owner as any)?.name,
                description: data.description,
                html_url: data.html_url,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };
        } catch (error: any) {
            return { error: `Failed to get authenticated app: ${error.message}` };
        }
    },
});
