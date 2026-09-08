// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getCheckSuite = tool({
    description: 'Get a check suite.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        check_suite_id: z.number().describe('The unique identifier of the check suite'),
    }),
    execute: async ({ githubToken, owner, repo, check_suite_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.checks.getSuite({
                owner,
                repo,
                check_suite_id,
            });
            return {
                id: data.id,
                status: data.status,
                conclusion: data.conclusion,
                head_sha: data.head_sha,
                head_branch: data.head_branch,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };
        } catch (error: any) {
            return { error: `Failed to get check suite: ${error.message}` };
        }
    },
});
