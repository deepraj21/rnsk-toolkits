// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getBlob = tool({
    description: 'Get a blob from a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        file_sha: z.string().describe('The SHA of the blob'),
    }),
    execute: async ({ githubToken, owner, repo, file_sha }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.git.getBlob({
                owner,
                repo,
                file_sha,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                sha: data.sha,
                size: data.size,
                url: data.url,
                content: data.content,
                encoding: data.encoding,
            };
        } catch (error: any) {
            return { error: `Failed to get blob: ${error.message}` };
        }
    },
});
