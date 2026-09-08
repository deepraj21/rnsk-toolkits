// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getRepositoryAdvisory = tool({
    description: 'Get a repository security advisory.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        ghsa_id: z.string().describe('The GHSA (GitHub Security Advisory) identifier'),
    }),
    execute: async ({ githubToken, owner, repo, ghsa_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.securityAdvisories.getRepositoryAdvisory({
                owner,
                repo,
                ghsa_id,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                ghsa_id: data.ghsa_id,
                cve_id: data.cve_id,
                summary: data.summary,
                description: data.description,
                severity: data.severity,
                state: data.state,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };
        } catch (error: any) {
            return { error: `Failed to get repository advisory: ${error.message}` };
        }
    },
});
