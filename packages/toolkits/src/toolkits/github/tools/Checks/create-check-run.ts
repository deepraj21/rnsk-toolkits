// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createCheckRun = tool({
    description: 'Create a check run for a commit in a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        name: z.string().describe('The name of the check'),
        head_sha: z.string().describe('The SHA of the commit'),
        status: z.enum(['queued', 'in_progress', 'completed']).optional().describe('The current status'),
        conclusion: z.enum(['action_required', 'cancelled', 'failure', 'neutral', 'success', 'skipped', 'stale', 'timed_out']).optional().describe('Required if status is completed'),
    }),
    execute: async ({ githubToken, owner, repo, name, head_sha, status, conclusion }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.checks.create({
                owner,
                repo,
                name,
                head_sha,
                status: status ?? 'queued',
                conclusion,
            });
            return {
                id: data.id,
                name: data.name,
                status: data.status,
                conclusion: data.conclusion,
                html_url: data.html_url,
            };
        } catch (error: any) {
            return { error: `Failed to create check run: ${error.message}` };
        }
    },
});
