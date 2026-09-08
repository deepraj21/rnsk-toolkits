// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listOrganizations = tool({
    description: 'List organizations. Lists all organizations, in the order that they were created on GitHub.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        since: z.number().optional().describe('The integer ID of the last organization that you saw'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
    }),
    execute: async ({ githubToken, since, per_page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.orgs.list({
                since,
                per_page: per_page ?? 30,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(org => ({
                login: org.login,
                id: org.id,
                url: org.url,
                description: org.description,
            }));
        } catch (error: any) {
            return { error: `Failed to list organizations: ${error.message}` };
        }
    },
});
