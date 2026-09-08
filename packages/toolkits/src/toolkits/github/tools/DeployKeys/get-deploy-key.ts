// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getDeployKey = tool({
    description: 'Get a specific deploy key from a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        key_id: z.number().describe('The unique identifier of the key'),
    }),
    execute: async ({ githubToken, owner, repo, key_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.getDeployKey({
                owner,
                repo,
                key_id,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                key: data.key,
                title: data.title,
                read_only: data.read_only,
                created_at: data.created_at,
            };
        } catch (error: any) {
            return { error: `Failed to get deploy key: ${error.message}` };
        }
    },
});
