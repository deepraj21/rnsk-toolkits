// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getCombinedStatus = tool({
    description: 'Get the combined status for a specific reference.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        ref: z.string().describe('The ref can be a SHA, a branch name, or a tag name'),
    }),
    execute: async ({ githubToken, owner, repo, ref }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.getCombinedStatusForRef({
                owner,
                repo,
                ref,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                state: data.state,
                sha: data.sha,
                total_count: data.total_count,
                statuses: data.statuses.map(status => ({
                    id: status.id,
                    state: status.state,
                    description: status.description,
                    context: status.context,
                })),
                repository: data.repository.full_name,
            };
        } catch (error: any) {
            return { error: `Failed to get combined status: ${error.message}` };
        }
    },
});
