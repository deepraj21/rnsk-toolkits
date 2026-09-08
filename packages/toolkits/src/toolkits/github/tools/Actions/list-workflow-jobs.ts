// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listWorkflowJobs = tool({
    description: 'List jobs for a workflow run. Returns job details including status, conclusion, and steps.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        run_id: z.number().describe('The unique identifier of the workflow run'),
        filter: z.enum(['latest', 'all']).optional().describe('Filter jobs by latest or all attempts'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, run_id, filter, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.actions.listJobsForWorkflowRun({
                owner,
                repo,
                run_id,
                filter: filter ?? 'latest',
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            return {
                total_count: data.total_count,
                jobs: data.jobs.map(job => ({
                    id: job.id,
                    run_id: job.run_id,
                    name: job.name,
                    status: job.status,
                    conclusion: job.conclusion,
                    started_at: job.started_at,
                    completed_at: job.completed_at,
                    html_url: job.html_url,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list workflow jobs: ${error.message}` };
        }
    },
});
