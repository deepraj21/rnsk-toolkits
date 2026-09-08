// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listCommitStatuses = tool({
    description: 'List commit statuses for a reference.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        ref: z.string().describe('The ref can be a SHA, a branch name, or a tag name'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, ref, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.listCommitStatusesForRef({
                owner,
                repo,
                ref,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(status => ({
                id: status.id,
                state: status.state,
                description: status.description,
                context: status.context,
                target_url: status.target_url,
                created_at: status.created_at,
            }));
        } catch (error: any) {
            return { error: `Failed to list commit statuses: ${error.message}` };
        }
    },
});
