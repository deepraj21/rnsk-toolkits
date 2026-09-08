// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listCodeScanningAlerts = tool({
    description: 'List code scanning alerts for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        state: z.enum(['open', 'dismissed', 'fixed']).optional().describe('Filter by state'),
        ref: z.string().optional().describe('Git reference'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, state, ref, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const response = await octokit.rest.codeScanning.listAlertsForRepo({
                owner,
                repo,
                state: state as any,
                ref,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            const data = response.data;
            if (!data) {
                return { error: 'No data returned from GitHub API' };
            }
            return {
                alerts: data.map(alert => ({
                    number: alert.number,
                    state: alert.state,
                    rule: alert.rule?.description,
                    severity: alert.rule?.severity,
                    created_at: alert.created_at,
                    html_url: alert.html_url,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list code scanning alerts: ${error.message}` };
        }
    },
});
