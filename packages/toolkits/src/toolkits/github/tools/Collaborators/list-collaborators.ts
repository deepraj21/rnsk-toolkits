// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listCollaborators = tool({
    description: 'List repository collaborators.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        affiliation: z.enum(['outside', 'direct', 'all']).optional().describe('Filter by affiliation'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, affiliation, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.listCollaborators({
                owner,
                repo,
                affiliation: affiliation ?? 'all',
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            return {
                collaborators: data.map(collab => ({
                    login: collab.login,
                    id: collab.id,
                    permissions: collab.permissions,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list collaborators: ${error.message}` };
        }
    },
});
