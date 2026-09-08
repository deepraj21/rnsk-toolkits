// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listWorkflows = tool({
    description: 'List GitHub Actions workflows for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        perPage: z.number().optional().default(30),
    }),
    execute: async ({ githubToken, owner, repo, perPage = 30 }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.actions.listRepoWorkflows({
                owner,
                repo,
                per_page: perPage,
            });
            return {
                total_count: data.total_count,
                workflows: data.workflows.map((wf) => ({
                    id: wf.id,
                    name: wf.name,
                    state: wf.state,
                    path: wf.path,
                    html_url: wf.html_url,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list workflows: ${error.message}` };
        }
    },
});
