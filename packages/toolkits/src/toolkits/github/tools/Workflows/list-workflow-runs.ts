// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listWorkflowRuns = tool({
    description: 'List GitHub Actions workflow runs.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        workflowId: z.union([z.string(), z.number()]).optional().describe('Specific workflow ID or filename to filter by'),
        status: z.enum(['completed', 'action_required', 'cancelled', 'failure', 'neutral', 'skipped', 'stale', 'success', 'timed_out', 'in_progress', 'queued', 'requested', 'waiting']).optional(),
        perPage: z.number().optional().default(30),
    }),
    execute: async ({ githubToken, owner, repo, workflowId, status, perPage = 30 }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            let data;
            if (workflowId) {
                const response = await octokit.rest.actions.listWorkflowRuns({
                    owner,
                    repo,
                    workflow_id: workflowId,
                    status,
                    per_page: perPage,
                });
                data = response.data;
            } else {
                const response = await octokit.rest.actions.listWorkflowRunsForRepo({
                    owner,
                    repo,
                    status,
                    per_page: perPage,
                });
                data = response.data;
            }

            return {
                total_count: data.total_count,
                workflow_runs: data.workflow_runs.map((run) => ({
                    id: run.id,
                    name: run.name,
                    status: run.status,
                    conclusion: run.conclusion,
                    html_url: run.html_url,
                    created_at: run.created_at,
                    updated_at: run.updated_at,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list workflow runs: ${error.message}` };
        }
    },
});
