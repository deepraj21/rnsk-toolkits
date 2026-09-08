// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listSecretScanningAlerts = tool({
    description: 'List secret scanning alerts for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        state: z.enum(['open', 'resolved']).optional().describe('Filter by state'),
        secret_type: z.string().optional().describe('Filter by secret type'),
        resolution: z.string().optional().describe('Filter by resolution'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, state, secret_type, resolution, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.secretScanning.listAlertsForRepo({
                owner,
                repo,
                state,
                secret_type,
                resolution,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(alert => ({
                number: alert.number,
                created_at: alert.created_at,
                updated_at: alert.updated_at,
                url: alert.url,
                html_url: alert.html_url,
                state: alert.state,
                resolution: alert.resolution,
                resolved_at: alert.resolved_at,
                resolved_by: alert.resolved_by?.login,
                secret_type: alert.secret_type,
                secret: alert.secret,
            }));
        } catch (error: any) {
            return { error: `Failed to list secret scanning alerts: ${error.message}` };
        }
    },
});
