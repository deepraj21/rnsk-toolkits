// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listIssueComments = tool({
    description: 'List comments on a GitHub issue or pull request.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        issueNumber: z.number().describe('Issue or PR number'),
        perPage: z.number().optional().default(30),
    }),
    execute: async ({ githubToken, owner, repo, issueNumber, perPage = 30 }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.issues.listComments({
                owner,
                repo,
                issue_number: issueNumber,
                per_page: perPage,
            });
            return {
                comments: data.map((comment) => ({
                    id: comment.id,
                    user: comment.user?.login,
                    body: comment.body,
                    created_at: comment.created_at,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list comments: ${error.message}` };
        }
    },
});
