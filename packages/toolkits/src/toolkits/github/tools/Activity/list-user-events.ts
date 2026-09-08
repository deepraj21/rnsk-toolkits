// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listUserEvents = tool({
    description: 'List events for the authenticated user. Returns recent activity for the authenticated user.',
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
            const { data } = await octokit.rest.activity.listEventsForAuthenticatedUser({
                username: 'placeholder', // This will be ignored by the API for authenticated user
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            return {
                events: data.map(event => ({
                    id: event.id,
                    type: event.type,
                    repo: event.repo?.name,
                    created_at: event.created_at,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list user events: ${error.message}` };
        }
    },
});
