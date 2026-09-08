// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getIssue = tool({
    description:
        'Get a single issue by its number in a GitHub repository. Use when the user wants to see the details of a specific issue.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        issue_number: z.number().describe('The number that identifies the issue'),
    }),
    execute: async ({ githubToken, owner, repo, issue_number }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        const { data } = await octokit.rest.issues.get({
            owner,
            repo,
            issue_number,
        });
        return {
            number: data.number,
            title: data.title,
            state: data.state,
            body: data.body,
            user: data.user?.login,
            html_url: data.html_url,
            created_at: data.created_at,
            updated_at: data.updated_at,
            comments: data.comments,
        };
    },
});
