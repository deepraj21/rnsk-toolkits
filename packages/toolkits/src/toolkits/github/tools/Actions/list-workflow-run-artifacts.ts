// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listWorkflowRunArtifacts = tool({
    description: 'List artifacts for a specific workflow run.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        run_id: z.number().describe('The unique identifier of the workflow run'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, run_id, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.actions.listWorkflowRunArtifacts({
                owner,
                repo,
                run_id,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            return {
                total_count: data.total_count,
                artifacts: data.artifacts.map(artifact => ({
                    id: artifact.id,
                    name: artifact.name,
                    size_in_bytes: artifact.size_in_bytes,
                    created_at: artifact.created_at,
                    expired: artifact.expired,
                    expires_at: artifact.expires_at,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list workflow run artifacts: ${error.message}` };
        }
    },
});
