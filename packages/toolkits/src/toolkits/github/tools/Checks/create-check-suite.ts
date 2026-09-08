// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createCheckSuite = tool({
    description: 'Create a check suite for a commit.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        head_sha: z.string().describe('The SHA of the commit'),
    }),
    execute: async ({ githubToken, owner, repo, head_sha }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.checks.createSuite({
                owner,
                repo,
                head_sha,
            });
            return {
                id: data.id,
                status: data.status,
                conclusion: data.conclusion,
                head_sha: data.head_sha,
                created_at: data.created_at,
            };
        } catch (error: any) {
            return { error: `Failed to create check suite: ${error.message}` };
        }
    },
});
