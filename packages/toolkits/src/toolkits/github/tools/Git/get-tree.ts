// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getTree = tool({
    description: 'Get a tree from a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        tree_sha: z.string().describe('The SHA of the tree'),
        recursive: z.boolean().optional().describe('If true, get a tree recursively'),
    }),
    execute: async ({ githubToken, owner, repo, tree_sha, recursive }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.git.getTree({
                owner,
                repo,
                tree_sha,
                recursive: recursive ? '1' : undefined,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                sha: data.sha,
                url: data.url,
                tree: data.tree.map(item => ({
                    path: item.path,
                    mode: item.mode,
                    type: item.type,
                    sha: item.sha,
                    size: item.size,
                    url: item.url,
                })),
                truncated: data.truncated,
            };
        } catch (error: any) {
            return { error: `Failed to get tree: ${error.message}` };
        }
    },
});
