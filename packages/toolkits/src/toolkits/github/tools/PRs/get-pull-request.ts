// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getPullRequest = tool({
    description: 'Get detailed information about a specific pull request.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        pullNumber: z.number().describe('Pull request number'),
    }),
    execute: async ({ githubToken, owner, repo, pullNumber }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.pulls.get({
                owner,
                repo,
                pull_number: pullNumber,
            });
            return {
                number: data.number,
                title: data.title,
                body: data.body,
                state: data.state,
                html_url: data.html_url,
                user: data.user?.login,
                head: data.head.ref,
                base: data.base.ref,
                merged: data.merged,
                mergeable: data.mergeable,
                comments: data.comments,
                commits: data.commits,
                additions: data.additions,
                deletions: data.deletions,
                changed_files: data.changed_files,
            };
        } catch (error: any) {
            return { error: `Failed to get PR: ${error.message}` };
        }
    },
});
