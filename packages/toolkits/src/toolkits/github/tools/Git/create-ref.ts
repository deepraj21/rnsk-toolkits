// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createRef = tool({
    description: 'Create a reference in a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        ref: z.string().describe('The name of the fully qualified reference (e.g., refs/heads/master)'),
        sha: z.string().describe('The SHA1 value with which you want to initialize this reference'),
    }),
    execute: async ({ githubToken, owner, repo, ref, sha }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.git.createRef({
                owner,
                repo,
                ref,
                sha,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                ref: data.ref,
                node_id: data.node_id,
                url: data.url,
                object: data.object,
            };
        } catch (error: any) {
            return { error: `Failed to create ref: ${error.message}` };
        }
    },
});
