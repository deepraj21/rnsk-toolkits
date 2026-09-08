// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createPullRequest = tool({
    description: 'Create a new pull request.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        title: z.string().describe('Title of the pull request'),
        head: z.string().describe('The name of the branch where your changes are implemented'),
        base: z.string().describe('The name of the branch you want the changes pulled into'),
        body: z.string().optional().describe('The contents of the pull request'),
        draft: z.boolean().optional().describe('Indicates whether the pull request is a draft'),
    }),
    execute: async ({ githubToken, owner, repo, title, head, base, body, draft }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.pulls.create({
                owner,
                repo,
                title,
                head,
                base,
                body,
                draft,
            });
            return {
                number: data.number,
                title: data.title,
                html_url: data.html_url,
                state: data.state,
            };
        } catch (error: any) {
            return { error: `Failed to create PR: ${error.message}` };
        }
    },
});
