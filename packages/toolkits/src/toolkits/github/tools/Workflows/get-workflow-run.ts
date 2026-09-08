// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getWorkflowRun = tool({
    description: 'Get details of a specific GitHub Actions workflow run.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        runId: z.number().describe('The ID of the workflow run'),
    }),
    execute: async ({ githubToken, owner, repo, runId }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.actions.getWorkflowRun({
                owner,
                repo,
                run_id: runId,
            });
            return {
                id: data.id,
                name: data.name,
                status: data.status,
                conclusion: data.conclusion,
                workflow_id: data.workflow_id,
                html_url: data.html_url,
                head_branch: data.head_branch,
                head_sha: data.head_sha,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };
        } catch (error: any) {
            return { error: `Failed to get workflow run: ${error.message}` };
        }
    },
});
