// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createDeployKey = tool({
    description: 'Create a deploy key for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        title: z.string().describe('A name for the key'),
        key: z.string().describe('The contents of the key'),
        read_only: z.boolean().optional().describe('If true, the key will only be able to read repository contents'),
    }),
    execute: async ({ githubToken, owner, repo, title, key, read_only }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.createDeployKey({
                owner,
                repo,
                title,
                key,
                read_only: read_only ?? true,
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
            return { error: `Failed to create deploy key: ${error.message}` };
        }
    },
});
