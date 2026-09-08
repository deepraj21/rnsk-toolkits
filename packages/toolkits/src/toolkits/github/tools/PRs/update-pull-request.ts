// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const updatePullRequest = tool({
    description: 'Update a pull request (title, body, state, base).',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        pullNumber: z.number().describe('Pull request number'),
        title: z.string().optional().describe('New title for the pull request'),
        body: z.string().optional().describe('New body for the pull request'),
        state: z.enum(['open', 'closed']).optional().describe('New state of the pull request'),
        base: z.string().optional().describe('The name of the branch you want your changes pulled into.'),
        maintainer_can_modify: z.boolean().optional().describe('Indicates whether maintainers can modify the pull request.'),
    }),
    execute: async ({ githubToken, owner, repo, pullNumber, title, body, state, base, maintainer_can_modify }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.pulls.update({
                owner,
                repo,
                pull_number: pullNumber,
                title,
                body,
                state,
                base,
                maintainer_can_modify,
            });
            return {
                number: data.number,
                title: data.title,
                state: data.state,
                html_url: data.html_url,
                merged: data.merged,
            };
        } catch (error: any) {
            return { error: `Failed to update PR: ${error.message}` };
        }
    },
});
