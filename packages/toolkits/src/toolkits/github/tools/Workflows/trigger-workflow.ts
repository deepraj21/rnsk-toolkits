// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const triggerWorkflow = tool({
    description: 'Trigger a GitHub Actions workflow dispatch event.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        workflowId: z.union([z.string(), z.number()]).describe('Workflow ID or filename (e.g., "main.yml")'),
        ref: z.string().describe('The git reference for the workflow (branch or tag)'),
        inputs: z.record(z.string(), z.string()).optional().describe('Input keys and values configured in the workflow file'),
    }),
    execute: async ({ githubToken, owner, repo, workflowId, ref, inputs }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.actions.createWorkflowDispatch({
                owner,
                repo,
                workflow_id: workflowId,
                ref,
                inputs: inputs || {},
            });
            return { message: 'Workflow triggered successfully' };
        } catch (error: any) {
            return { error: `Failed to trigger workflow: ${error.message}` };
        }
    },
});
