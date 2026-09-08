// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listPublicEvents = tool({
    description: 'List public events on GitHub. Returns recent public activity across GitHub.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.activity.listPublicEvents({
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            return {
                events: data.map(event => ({
                    id: event.id,
                    type: event.type,
                    actor: event.actor?.login,
                    repo: event.repo?.name,
                    created_at: event.created_at,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list public events: ${error.message}` };
        }
    },
});
