// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createTree = tool({
    description: 'Create a tree in a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        tree: z.array(z.object({
            path: z.string().optional(),
            mode: z.enum(['100644', '100755', '040000', '160000', '120000']).optional(),
            type: z.enum(['blob', 'tree', 'commit']).optional(),
            sha: z.string().optional().nullable(),
            content: z.string().optional(),
        })).describe('The objects (blobs or trees) to create fine-grained control of the repository content'),
        base_tree: z.string().optional().describe('The SHA1 of the tree you want to update with new data'),
    }),
    execute: async ({ githubToken, owner, repo, tree, base_tree }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.git.createTree({
                owner,
                repo,
                tree,
                base_tree,
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
            };
        } catch (error: any) {
            return { error: `Failed to create tree: ${error.message}` };
        }
    },
});
