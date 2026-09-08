// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listRepositoryAdvisories = tool({
    description: 'List repository security advisories.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.securityAdvisories.listRepositoryAdvisories({
                owner,
                repo,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(advisory => ({
                ghsa_id: advisory.ghsa_id,
                cve_id: advisory.cve_id,
                summary: advisory.summary,
                description: advisory.description,
                severity: advisory.severity,
                state: advisory.state,
                created_at: advisory.created_at,
                updated_at: advisory.updated_at,
                published_at: advisory.published_at,
                withdrawn_at: advisory.withdrawn_at,
                html_url: advisory.html_url,
            }));
        } catch (error: any) {
            return { error: `Failed to list repository advisories: ${error.message}` };
        }
    },
});
