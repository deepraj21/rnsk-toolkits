// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const addIssueComment = tool({
    description: 'Add a comment to a GitHub issue or pull request.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        issueNumber: z.number().describe('Issue or PR number'),
        body: z.string().describe('Comment body'),
    }),
    execute: async ({ githubToken, owner, repo, issueNumber, body }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number: issueNumber,
                body,
            });
            return {
                id: data.id,
                body: data.body,
                html_url: data.html_url,
                created_at: data.created_at,
            };
        } catch (error: any) {
            return { error: `Failed to add comment: ${error.message}` };
        }
    },
});
