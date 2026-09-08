// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getRef = tool({
    description: 'Get a reference from a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        ref: z.string().describe('The name of the reference (e.g., heads/branch-name)'),
    }),
    execute: async ({ githubToken, owner, repo, ref }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.git.getRef({
                owner,
                repo,
                ref,
            });
            if (!data) return { error: 'No data returned from GitHub API' };

            // Handle array or single object
            const refs = Array.isArray(data) ? data : [data];
            return {
                references: refs.map(r => ({
                    ref: r.ref,
                    node_id: r.node_id,
                    url: r.url,
                    object: r.object,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to get ref: ${error.message}` };
        }
    },
});
