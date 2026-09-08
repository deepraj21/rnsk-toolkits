// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listDependabotAlerts = tool({
    description: 'List Dependabot alerts for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        state: z.enum(['auto_dismissed', 'dismissed', 'fixed', 'open']).optional().describe('Filter by state'),
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Filter by severity'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, state, severity, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.dependabot.listAlertsForRepo({
                owner,
                repo,
                state,
                severity,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            return {
                alerts: data.map(alert => ({
                    number: alert.number,
                    state: alert.state,
                    dependency: alert.dependency?.package?.name,
                    security_advisory: alert.security_advisory?.summary,
                    severity: alert.security_advisory?.severity,
                    html_url: alert.html_url,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list Dependabot alerts: ${error.message}` };
        }
    },
});
