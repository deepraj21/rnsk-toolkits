// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createPullRequestReview = tool({
    description: 'Create a review for a pull request (approve, request changes, or comment).',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        pullNumber: z.number().describe('Pull request number'),
        event: z.enum(['APPROVE', 'REQUEST_CHANGES', 'COMMENT']).describe('Review action'),
        body: z.string().optional().describe('Review body/comment'),
    }),
    execute: async ({ githubToken, owner, repo, pullNumber, event, body }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.pulls.createReview({
                owner,
                repo,
                pull_number: pullNumber,
                event,
                body,
            });
            return {
                id: data.id,
                state: data.state,
                html_url: data.html_url,
            };
        } catch (error: any) {
            return { error: `Failed to create review: ${error.message}` };
        }
    },
});
