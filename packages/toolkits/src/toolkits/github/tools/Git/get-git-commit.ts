// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getGitCommit = tool({
    description: 'Get a low-level Git commit object.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        commit_sha: z.string().describe('The SHA of the commit'),
    }),
    execute: async ({ githubToken, owner, repo, commit_sha }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.git.getCommit({
                owner,
                repo,
                commit_sha,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                sha: data.sha,
                url: data.url,
                author: data.author,
                committer: data.committer,
                message: data.message,
                tree: data.tree,
                parents: data.parents,
            };
        } catch (error: any) {
            return { error: `Failed to get git commit: ${error.message}` };
        }
    },
});
