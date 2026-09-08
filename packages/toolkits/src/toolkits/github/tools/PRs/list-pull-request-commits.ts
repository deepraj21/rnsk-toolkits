// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listPullRequestCommits = tool({
    description: 'List commits on a pull request.',
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
            const { data } = await octokit.rest.pulls.listCommits({
                owner,
                repo,
                pull_number: pullNumber,
            });
            return data.map(commit => ({
                sha: commit.sha,
                message: commit.commit.message,
                author: commit.commit.author?.name,
                date: commit.commit.author?.date,
                url: commit.html_url,
            }));
        } catch (error: any) {
            return { error: `Failed to list PR commits: ${error.message}` };
        }
    },
});
