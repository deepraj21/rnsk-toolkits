// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const updateIssue = tool({
    description: 'Update a GitHub issue (close, reopen, edit title/body).',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        issueNumber: z.number().describe('Issue number'),
        title: z.string().optional().describe('New title'),
        body: z.string().optional().describe('New body'),
        state: z.enum(['open', 'closed']).optional().describe('New state'),
    }),
    execute: async ({ githubToken, owner, repo, issueNumber, title, body, state }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.issues.update({
                owner,
                repo,
                issue_number: issueNumber,
                title,
                body,
                state,
            });
            return {
                number: data.number,
                title: data.title,
                state: data.state,
                html_url: data.html_url,
            };
        } catch (error: any) {
            return { error: `Failed to update issue: ${error.message}` };
        }
    },
});
