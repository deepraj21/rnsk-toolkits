// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listGlobalAdvisories = tool({
    description: 'List global security advisories.',
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
            const { data } = await octokit.rest.securityAdvisories.listGlobalAdvisories({
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(advisory => ({
                ghsa_id: advisory.ghsa_id,
                cve_id: advisory.cve_id,
                summary: advisory.summary,
                severity: advisory.severity,
                html_url: advisory.html_url,
            }));
        } catch (error: any) {
            return { error: `Failed to list global advisories: ${error.message}` };
        }
    },
});
