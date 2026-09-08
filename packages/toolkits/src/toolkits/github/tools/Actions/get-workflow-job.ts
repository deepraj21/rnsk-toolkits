// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getWorkflowJob = tool({
    description: 'Get a specific job for a workflow run. Returns detailed job information including steps.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        job_id: z.number().describe('The unique identifier of the job'),
    }),
    execute: async ({ githubToken, owner, repo, job_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.actions.getJobForWorkflowRun({
                owner,
                repo,
                job_id,
            });
            return {
                id: data.id,
                run_id: data.run_id,
                name: data.name,
                status: data.status,
                conclusion: data.conclusion,
                started_at: data.started_at,
                completed_at: data.completed_at,
                html_url: data.html_url,
                steps: data.steps?.map(step => ({
                    name: step.name,
                    status: step.status,
                    conclusion: step.conclusion,
                    number: step.number,
                    started_at: step.started_at,
                    completed_at: step.completed_at,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to get workflow job: ${error.message}` };
        }
    },
});
