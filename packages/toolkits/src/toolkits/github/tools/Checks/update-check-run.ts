// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const updateCheckRun = tool({
    description: 'Update a check run.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        check_run_id: z.number().describe('The unique identifier of the check run'),
        status: z.enum(['queued', 'in_progress', 'completed']).optional().describe('The current status'),
        conclusion: z.enum(['action_required', 'cancelled', 'failure', 'neutral', 'success', 'skipped', 'stale', 'timed_out']).optional().describe('Required if status is completed'),
    }),
    execute: async ({ githubToken, owner, repo, check_run_id, status, conclusion }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.checks.update({
                owner,
                repo,
                check_run_id,
                status,
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
            return { error: `Failed to update check run: ${error.message}` };
        }
    },
});
