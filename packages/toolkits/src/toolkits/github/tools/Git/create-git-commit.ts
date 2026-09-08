// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createGitCommit = tool({
    description: 'Create a new low-level Git commit object.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        message: z.string().describe('The commit message'),
        tree: z.string().describe('The SHA of the tree object this commit points to'),
        parents: z.array(z.string()).describe('The SHAs of the commits that were the parents of this commit'),
        author: z.object({
            name: z.string(),
            email: z.string(),
            date: z.string().optional(),
        }).optional().describe('Information about the author of the commit'),
    }),
    execute: async ({ githubToken, owner, repo, message, tree, parents, author }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.git.createCommit({
                owner,
                repo,
                message,
                tree,
                parents,
                author,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                sha: data.sha,
                url: data.url,
                message: data.message,
                author: data.author,
                committer: data.committer,
                tree: data.tree,
                parents: data.parents,
            };
        } catch (error: any) {
            return { error: `Failed to create git commit: ${error.message}` };
        }
    },
});
