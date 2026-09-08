// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listInstallations = tool({
    description: 'List installations for the authenticated GitHub App.',
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
            const { data } = await octokit.rest.apps.listInstallations({
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            return {
                installations: data.map(installation => ({
                    id: installation.id,
                    account: (installation.account as any)?.login || (installation.account as any)?.name,
                    app_id: installation.app_id,
                    target_type: installation.target_type,
                    created_at: installation.created_at,
                    updated_at: installation.updated_at,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list installations: ${error.message}` };
        }
    },
});
