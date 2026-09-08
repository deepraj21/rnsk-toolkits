// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const forkRepo = tool({
    description: 'Fork a GitHub repository to your account or an organization.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        organization: z.string().optional().describe('Optional: Organization to fork to'),
    }),
    execute: async ({ githubToken, owner, repo, organization }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.createFork({
                owner,
                repo,
                organization,
            });
            return {
                full_name: data.full_name,
                html_url: data.html_url,
                message: 'Fork created successfully',
            };
        } catch (error: any) {
            return { error: `Failed to fork repo: ${error.message}` };
        }
    },
});
