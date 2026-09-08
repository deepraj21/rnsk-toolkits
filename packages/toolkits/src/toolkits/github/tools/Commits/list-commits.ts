// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listCommits = tool({
    description: 'List commits on a GitHub repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        perPage: z.number().optional().default(30),
        sha: z.string().optional().describe('SHA or branch to start listing from'),
        path: z.string().optional().describe('Only commits containing this file path'),
    }),
    execute: async ({ githubToken, owner, repo, perPage = 30, sha, path }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.listCommits({
                owner,
                repo,
                per_page: perPage,
                sha,
                path,
            });
            return {
                commits: data.map((commit) => ({
                    sha: commit.sha,
                    message: commit.commit.message,
                    author: commit.commit.author?.name,
                    date: commit.commit.author?.date,
                    html_url: commit.html_url,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list commits: ${error.message}` };
        }
    },
});
