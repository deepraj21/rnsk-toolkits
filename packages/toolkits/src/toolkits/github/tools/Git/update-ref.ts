// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const updateRef = tool({
    description: 'Update a reference in a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        ref: z.string().describe('The name of the reference (e.g., heads/branch-name)'),
        sha: z.string().describe('The SHA1 value to set this reference to'),
        force: z.boolean().optional().describe('Indicates whether to force the update or not'),
    }),
    execute: async ({ githubToken, owner, repo, ref, sha, force }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.git.updateRef({
                owner,
                repo,
                ref,
                sha,
                force: force ?? false,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                ref: data.ref,
                node_id: data.node_id,
                url: data.url,
                object: data.object,
            };
        } catch (error: any) {
            return { error: `Failed to update ref: ${error.message}` };
        }
    },
});
