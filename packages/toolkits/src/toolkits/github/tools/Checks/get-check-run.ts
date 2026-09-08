// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getCheckRun = tool({
    description: 'Get a check run.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        check_run_id: z.number().describe('The unique identifier of the check run'),
    }),
    execute: async ({ githubToken, owner, repo, check_run_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.checks.get({
                owner,
                repo,
                check_run_id,
            });
            return {
                id: data.id,
                name: data.name,
                status: data.status,
                conclusion: data.conclusion,
                started_at: data.started_at,
                completed_at: data.completed_at,
                html_url: data.html_url,
            };
        } catch (error: any) {
            return { error: `Failed to get check run: ${error.message}` };
        }
    },
});
