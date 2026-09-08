// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listGists = tool({
    description: 'List the authenticated user\'s gists or public gists.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        perPage: z.number().optional().default(30),
        since: z.string().optional().describe('Filter gists starting from this date'),
    }),
    execute: async ({ githubToken, perPage = 30, since }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.gists.list({
                per_page: perPage,
                since,
            });
            return {
                gists: data.map((gist) => ({
                    id: gist.id,
                    description: gist.description,
                    public: gist.public,
                    html_url: gist.html_url,
                    files: Object.keys(gist.files || {}),
                    created_at: gist.created_at,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list gists: ${error.message}` };
        }
    },
});
