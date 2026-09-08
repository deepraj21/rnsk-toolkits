// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listCheckRuns = tool({
    description: 'List check runs for a Git reference.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        ref: z.string().describe('Git reference (branch, tag, or SHA)'),
        check_name: z.string().optional().describe('Filter by check name'),
        status: z.enum(['queued', 'in_progress', 'completed']).optional().describe('Filter by status'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, ref, check_name, status, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.checks.listForRef({
                owner,
                repo,
                ref,
                check_name,
                status,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            return {
                total_count: data.total_count,
                check_runs: data.check_runs.map(run => ({
                    id: run.id,
                    name: run.name,
                    status: run.status,
                    conclusion: run.conclusion,
                    started_at: run.started_at,
                    completed_at: run.completed_at,
                    html_url: run.html_url,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list check runs: ${error.message}` };
        }
    },
});
