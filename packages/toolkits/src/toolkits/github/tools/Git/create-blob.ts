// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createBlob = tool({
    description: 'Create a blob in a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        content: z.string().describe('The new blob\'s content'),
        encoding: z.enum(['utf-8', 'base64']).optional().describe('The encoding used for content'),
    }),
    execute: async ({ githubToken, owner, repo, content, encoding }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.git.createBlob({
                owner,
                repo,
                content,
                encoding: encoding ?? 'utf-8',
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                sha: data.sha,
                url: data.url,
            };
        } catch (error: any) {
            return { error: `Failed to create blob: ${error.message}` };
        }
    },
});
